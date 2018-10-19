import {Client, ExtendedAccount} from 'dsteem'
import * as _ from 'lodash'
import * as moment from 'moment'
const nodecache = require( 'node-cache' )
import * as config from 'config'
import { Dictionary } from 'lodash'
import {logger} from '../logger'
import {UserAccount, UserAccountJSON, UserContext, UserContextJSON} from './user'
import {loadAccountNames} from './indexes'

const STEEMD_API_URL = 'https://api.steemit.com'
const CACHE_CLIENT_TTL = 600 // config.get('cacheClient')['ttl'] FIXME
const CACHE_CLIENT_CHECK_INTERVAL = 60 // config.get('cacheClient')['interval'] FIXME
enum FollowType {undefined, blog, ignore}

export interface FollowCountReturn {
    account: string
    follower_count: number
    following_count: number
}

export interface FollowReturn {
    follower: string
    following: string
    what: string[]
}

export type TransferTargetCounts = Dictionary<number>

interface AccountHistoryItem {
    block: number
    op: [string, object]
    op_in_trx: number
    timestamp: string
    trx_id: string
    trx_in_block: number
    virtual_op: number
}

interface AccountHistoryPair {
    [index: number]: [number, AccountHistoryItem]
}

export class CachingClient {
    private readonly pageSize: number = 1000

    constructor(public readonly cache?: any,
                public readonly cacheOptions = {stdTTL: CACHE_CLIENT_TTL, checkperiod: CACHE_CLIENT_CHECK_INTERVAL},
                private readonly client?: any,
                public readonly address = STEEMD_API_URL) {
        if (cache === undefined) {
            this.cache = new nodecache(cacheOptions)
        } else {
            this.cache = cache
        }
        if (client === undefined) {
            this.client = new Client(address)
        } else {
            this.client = client
        }
    }

    public async getExtendedAccount(account: string): Promise<ExtendedAccount> {
        const [result] = await this.call('condenser_api', 'get_accounts', [[account]])
        return result
    }

    public async getFollowCount(account: string): Promise<FollowCountReturn> {
        return await this.call('condenser_api', 'get_follow_count', [account])
    }

    public async* followGen(method: string, account: string, followType: FollowType, start = '') {
        let pageCount = 0
        while (true) {
            pageCount += 1
            const results = await this.call('condenser_api', method, [
                account,
                start,
                followType,
                this.pageSize
            ])
            const lastResult = results[results.length - 1]
            yield* results
            logger.info(`p:${pageCount} start:${start} last:${lastResult} length:${results.length}`)
            if (start === lastResult  || results.length < this.pageSize) {
                break
            }
            if (method === 'get_followers') {
                start = lastResult['follower']
            } else {
                start = lastResult['following']
            }
        }
    }

    public async getFollowers(account: string, start = 0, limit = 1000): Promise<FollowReturn[]> {
        const followType = FollowType.blog
        const followers: any[] = []
        for await (const results of this.followGen('get_followers', account, followType )) {
            followers.push(results)
        }
        return followers
    }

    public async getIgnored(account: string, start = 0, limit = 1000): Promise<FollowReturn[]> {
        const followType = FollowType.ignore
        const followers: any[] = []
        for await (const results of this.followGen('get_followers', account, followType )) {
            followers.push(results)
        }
        return followers
    }

    public async getFollowing(account: string, start = 0, limit = 1000): Promise<FollowReturn[]> {
        const followType = FollowType.blog
        const followers: any[] = []
        for await (const results of this.followGen('get_following', account, followType )) {
            followers.push(results)
        }
        return followers
    }

    public async* accountHistoryGenerator(account: string) {
        let pointer: number = -1
        let pageCount = 0
        let accountHistoryLength: number
        let totalPages: number = 1
        while (true) {
            pageCount += 1
            const resultsPage = await this.call(
                'condenser_api',
                'get_account_history',
                [account, pointer, this.pageSize])
            if (pageCount === 1) {
                accountHistoryLength = resultsPage[resultsPage.length - 1][0]
                pointer = accountHistoryLength
                totalPages = Math.ceil(accountHistoryLength / this.pageSize)
            }
            yield* _.reverse(resultsPage)
            if (pageCount === totalPages) {
                break
            } else {
                pointer = pointer - this.pageSize
                if (pointer <= this.pageSize) {
                    pointer = this.pageSize
                }
            }
        }
    }

    public async* accountHistoryNewerThanGenerator(account: string, days = 30) {
        const maxAge = moment.utc().subtract(days, 'days')
        for await (const result of this.accountHistoryGenerator(account)) {
            if (moment.utc(_.get(result, [1, 'timestamp'])).isAfter(maxAge)) {
                yield result
            } else {
                break
            }
        }
    }

    public async getAccountTransferTargetCounts(account: string, days = 30): Promise<TransferTargetCounts> {
        const key = `accountTransferTargetCounts__${account}__${days}`
        const cachedResult = this.cache.get(key)
        if (cachedResult !== undefined) {
            logger.info(`hit ${key}`)
            return cachedResult
        } else {
            const accounts: string[] = []
            for await (const item of this.accountHistoryNewerThanGenerator(account, days)) {
                if (_.get(item, [1, 'op', 0]) === 'transfer') {
                    accounts.push(_.get(item, [1, 'op', 1, 'to']))
                }
            }
            const counts = _.countBy(accounts)
            this.cache.set(key, counts)
            logger.info(`set ${key}`)
            return counts
        }
    }

    public async loadAccountInfo(account: string, days = 30): Promise<[ExtendedAccount,
        FollowCountReturn,
        TransferTargetCounts,
        FollowReturn[],
        FollowReturn[],
        FollowReturn[]]> {
        return await Promise.all([
                                     this.getExtendedAccount(account),
                                     this.getFollowCount(account),
                                     this.getAccountTransferTargetCounts(account, days),
                                     this.getFollowers(account),
                                     this.getFollowing(account),
                                     this.getIgnored(account)
                                 ])
    }

    public async call(api: string, method: string, params?: any, ttl?: number) {
        const key = `call__${api}__${method}__${params}`
        const cachedResult = this.cache.get(key)
        if (cachedResult !== undefined) {
            logger.info(`hit ${key}`)
            return cachedResult
        } else {
            const result = await this.client.call(api, method, params)
            if (ttl !== undefined) {
                this.cache.set(key, result, ttl)
                logger.info(`set ttl:${ttl} ${key}`)
            } else {
                this.cache.set(key, result)
                logger.info(`set ttl:${ttl} ${key}`)
            }
            return result
        }
    }

    public cacheUserAccount(userAccount: UserAccount) {
        const key = `UserAccount_${userAccount.account}`
        this.cache.set(key, userAccount)
        logger.info(`set ${key}`)
    }

    public loadUserAccount(account: string) {
        const key = `UserAccount_${account}`
        return this.cache.get(key)
    }

    public cacheUserContext(userContext: UserContext) {
        const key = `UserContext__${userContext.account}__${userContext.context_account}`
        this.cache.set(key, userContext)
        logger.info(`set ${key}`)
    }

    public loadUserContext(account: string, contextAccount: string) {
        const key = `UserContext__${account}__${contextAccount}`
        return this.cache.get(key)
    }

    public async loadAccount(account: string,
                             contextAccount?: string,
                             days = 30): Promise<[UserAccount, UserContext | undefined]> {
        const userAccountKey = `UserAccount__${account}`
        let userAccount = this.cache.get(userAccountKey)
        if (userAccount === undefined) {
            const [extendedAccount,
                followCount,
                accountTransferTargetCount,
                followers,
                following,
                ignored] = await this.loadAccountInfo(account, days)
            userAccount = new UserAccount(extendedAccount,
                                          followCount,
                                          accountTransferTargetCount,
                                          followers,
                                          following,
                                          ignored)

            this.cache.set(userAccountKey, userAccount)
        }

        if (contextAccount !== undefined) {
            const userContextKey = `UserContext__${account}__${contextAccount}`
            let userContext = this.cache.get(userContextKey)
            if (userContext === undefined) {
                userContext = userAccount.userContext(contextAccount)
                this.cache.set(userContextKey, userContext)
            }
            return [userAccount, userContext]
        } else {
            return [userAccount, undefined]
        }
    }

    public async loadAccountJSON(account: string, contextAccount?: string, days = 30): Promise<UserAccountJSON> {
        const [userAccount, userContext] = await this.loadAccount(account, contextAccount, days)
        return userAccount.toJSONWithContext(userContext)
    }

    public async loadAccounts(accounts: string[]|Set<string>, contextAccount?: string, days = 30) {
        const promises: Array<Promise<[UserAccount, UserContext | undefined]>> = []
        for (const account of accounts) {
            promises.push(this.loadAccount(account, contextAccount, days))
        }
        return await Promise.all(promises)
    }

    public async loadAccountsJSON(accounts, contextAccount?: string, days = 30) {
        const userAccounts = await this.loadAccounts(accounts, contextAccount, days)
        return _.map(userAccounts, (value) => {
            const [userAccount, userContext] = value
            return userAccount.toJSONWithContext(userContext)
        })
    }
}