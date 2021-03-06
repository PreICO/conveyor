# Conveyor-API

An api which handles various stemit rpc requests.  
This api follows the json-rpc 2.0 specification. More information available at http://www.jsonrpc.org/specification.

## Drafts

Drafts provide ability to store and resume editing posts.

## Feature Flags

Feature flags allows our apps (condenser mainly) to hide certain features behind flags.  
Flags can be set individually for users or probabilistically to roll out a feature incrementally, for example `set_flag_probability orange_theme 0.5` will enable the flag for ~50% of our users. Changing the flag probability does not re-randomize the user selection so that a user that had their flag enabled at 0.5 will still have it enabled when going to 0.75. This is achieved by seeding a PRNG with the shasum of username+flag.  
Flags set individually per user always takes precedence.

## User Data

Conveyor is the central point for storing sensitive user data (email, phone, etc). No other services should store this data and should instead query for it here every time.

## Tags

Tagging mechanism for other services, allows defining and assigning tags to accounts (or other identifiers) and querying for them.

<strong>Version 1.0</strong>

---

- [conveyor.list_drafts](#conveyor.list_drafts)
- [conveyor.save_draft](#conveyor.save_draft)
- [conveyor.remove_draft](#conveyor.remove_draft)
- [conveyor.get_feature_flag](#conveyor.get_feature_flag)
- [conveyor.set_feature_flag](#conveyor.set_feature_flag)
- [conveyor.get_feature_flags](#conveyor.get_feature_flags)
- [conveyor.set_feature_flag_probability](#conveyor.set_feature_flag_probability)
- [conveyor.get_feature_flag_probabilities](#conveyor.get_feature_flag_probabilities)
- [conveyor.get_user_data](#conveyor.get_user_data)
- [conveyor.set_user_data](#conveyor.set_user_data)
- [conveyor.is_email_registered](#conveyor.is_email_registered)
- [conveyor.is_phone_registered](#conveyor.is_phone_registered)
- [conveyor.define_tag](#conveyor.define_tag)
- [conveyor.list_tags](#conveyor.list_tags)
- [conveyor.assign_tag](#conveyor.assign_tag)
- [conveyor.unassign_tag](#conveyor.unassign_tag)
- [conveyor.get_users_by_tags](#conveyor.get_users_by_tags)
- [conveyor.get_tags_for_user](#conveyor.get_tags_for_user)
- [conveyor.get_account](#conveyor.get_account)
- [conveyor.autocomplete_account](#conveyor.autocomplete_account)

---

<a name="conveyor.list_drafts"></a>

## conveyor.list_drafts

List stored drafts for account.

### Description

_Authenticated: requires signature of account or an admin account._

### Parameters

| Name           | Type   | Description              |
| -------------- | ------ | ------------------------ |
| params         | object |                          |
| params.account | string | earthshare blockchain account |

### Result

| Name             | Type   | Description |
| ---------------- | ------ | ----------- |
| result           | array  |             |
| result[#]        | object |             |
| result[#]?.title | string |             |
| result[#]?.body  | string |             |
| result[#]?.uuid  | string |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.list_drafts",
  "params": {
    "account": "earthshare"
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": [
    {
      "title": "example draft title",
      "body": "example draft body",
      "uuid": "dce998f6-b811-4181-a056-19886a6db7c6"
    }
  ]
}
```

<a name="conveyor.save_draft"></a>

## conveyor.save_draft

Save draft for account.

### Description

_Authenticated: requires signature of account or an admin account._

### Parameters

| Name                | Type   | Description              |
| ------------------- | ------ | ------------------------ |
| params              | object |                          |
| params.account      | string | earthshare blockchain account |
| params.draft        | object |                          |
| params.draft?.title | string |                          |
| params.draft?.body  | string |                          |

### Result

| Name         | Type   | Description |
| ------------ | ------ | ----------- |
| result       | object |             |
| result?.uuid | string |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.save_draft",
  "params": {
    "account": "earthshare",
    "draft": {
      "title": "example draft title",
      "body": "example draft body"
    }
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": {
    "uuid": "dce998f6-b811-4181-a056-19886a6db7c6"
  }
}
```

<a name="conveyor.remove_draft"></a>

## conveyor.remove_draft

Delete saved draft with uuid for account.

### Description

_Authenticated: requires signature of account or an admin account._

### Parameters

| Name           | Type   | Description              |
| -------------- | ------ | ------------------------ |
| params         | object |                          |
| params.account | string | earthshare blockchain account |
| params.uuid    | string |                          |

### Result

| Name         | Type   | Description |
| ------------ | ------ | ----------- |
| result       | object |             |
| result?.uuid | string |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.remove_draft",
  "params": {
    "account": "earthshare",
    "uuid": "dce998f6-b811-4181-a056-19886a6db7c6"
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": {
    "uuid": "dce998f6-b811-4181-a056-19886a6db7c6"
  }
}
```

<a name="conveyor.get_feature_flag"></a>

## conveyor.get_feature_flag

Get specific flag for the username account.

### Description

_Authenticated: requires signature of account or an admin account._

### Parameters

| Name           | Type   | Description              |
| -------------- | ------ | ------------------------ |
| params         | object |                          |
| params.account | string | earthshare blockchain account |
| params.flag    | string |                          |

### Result

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| result | object |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.get_feature_flag",
  "params": {
    "account": "earthshare",
    "flag": "example-flag"
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": {}
}
```

<a name="conveyor.set_feature_flag"></a>

## conveyor.set_feature_flag

Set a flag override for the username account.

### Description

_Authenticated: requires signature of account or an admin account._

### Parameters

| Name           | Type   | Description              |
| -------------- | ------ | ------------------------ |
| params         | object |                          |
| params.account | string | earthshare blockchain account |
| params.flag    | string |                          |
| params.value   |        |                          |

### Result

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| result | object |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.set_feature_flag",
  "params": {
    "account": "earthshare",
    "flag": "example-flag"
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": {}
}
```

<a name="conveyor.get_feature_flags"></a>

## conveyor.get_feature_flags

Get feature flags object for the username account

### Description

_Authenticated: requires signature of account or an admin account._

### Parameters

| Name           | Type   | Description              |
| -------------- | ------ | ------------------------ |
| params         | object |                          |
| params.account | string | earthshare blockchain account |

### Result

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| result | object |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.get_feature_flags",
  "params": {
    "account": "earthshare"
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": {}
}
```

<a name="conveyor.set_feature_flag_probability"></a>

## conveyor.set_feature_flag_probability

Set the probability expressed as a fraction 0.0 to 1.0 that a flag will resolve to true.

### Description

_Authenticated: requires signature of account or an admin account._

### Parameters

| Name               | Type   | Description |
| ------------------ | ------ | ----------- |
| params             | object |             |
| params.flag        | string |             |
| params.probability | number |             |

### Result

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| result | object |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.set_feature_flag_probability",
  "params": {
    "flag": "example-flag",
    "probability": 0.5
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": {}
}
```

<a name="conveyor.get_feature_flag_probabilities"></a>

## conveyor.get_feature_flag_probabilities

Get all the set flag probabilities.

### Description

_Authenticated: requires signature of account or an admin account._

### Parameters

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| params | object |             |

### Result

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| result | object |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.get_feature_flag_probabilities",
  "params": {}
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": {}
}
```

<a name="conveyor.get_user_data"></a>

## conveyor.get_user_data

Return user data for account, returns an error if the account is not found.

### Description

_Authenticated: requires signature of account or an admin account._

### Parameters

| Name           | Type   | Description              |
| -------------- | ------ | ------------------------ |
| params         | object |                          |
| params.account | string | earthshare blockchain account |

### Result

| Name          | Type   | Description |
| ------------- | ------ | ----------- |
| result        | object |             |
| result?.email | string |             |
| result?.phone | string |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.get_user_data",
  "params": {
    "account": "earthshare"
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": {
    "email": "earthshare@earthshare.com",
    "phone": "+10008675309"
  }
}
```

<a name="conveyor.set_user_data"></a>

## conveyor.set_user_data

Set user data for account.

### Description

_Authenticated: requires signature of account or an admin account._

### Parameters

| Name                   | Type   | Description              |
| ---------------------- | ------ | ------------------------ |
| params                 | object |                          |
| params.account         | string | earthshare blockchain account |
| params.userData        | object |                          |
| params.userData?.email | string |                          |
| params.userData?.phone | string |                          |

### Result

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| result | object |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.set_user_data",
  "params": {
    "account": "earthshare",
    "userData": {
      "email": "earthshare@earthshare.com",
      "phone": "+10008675309"
    }
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": {}
}
```

<a name="conveyor.is_email_registered"></a>

## conveyor.is_email_registered

Check if the email address is in the database.

### Description

_Authenticated: requires signature of account or an admin account._

### Parameters

| Name         | Type   | Description |
| ------------ | ------ | ----------- |
| params       | object |             |
| params.email | string |             |

### Result

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| result | boolean |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.is_email_registered",
  "params": {
    "email": "earthshare@earthshare.com"
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": false
}
```

<a name="conveyor.is_phone_registered"></a>

## conveyor.is_phone_registered

Check if the phone number is in the database.

### Description

_Authenticated: requires signature of account or an admin account._

### Parameters

| Name         | Type   | Description |
| ------------ | ------ | ----------- |
| params       | object |             |
| params.phone | string |             |

### Result

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| result | boolean |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.is_phone_registered",
  "params": {
    "phone": "+10008675309"
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": false
}
```

<a name="conveyor.define_tag"></a>

## conveyor.define_tag

### Description

_Authenticated: requires signature of admin account._

### Parameters

| Name               | Type   | Description |
| ------------------ | ------ | ----------- |
| params             | object |             |
| params.tag         | string |             |
| params.description | string |             |

### Result

| Name   | Type    | Description |
| ------ | ------- | ----------- |
| result | boolean |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.define_tag",
  "params": {
    "tag": "example-tag",
    "description": "tag-string is an example tag"
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": false
}
```

<a name="conveyor.list_tags"></a>

## conveyor.list_tags

List all defined tags.

### Description

_Authenticated: requires signature of admin account._

### Parameters

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| params | object |             |

### Result

| Name      | Type   | Description |
| --------- | ------ | ----------- |
| result    | array  |             |
| result[#] | string |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.list_tags",
  "params": {}
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": ["example-tag"]
}
```

<a name="conveyor.assign_tag"></a>

## conveyor.assign_tag

Assign tag to user, throws if tag is not defined.

### Description

_Authenticated: requires signature of admin account._

### Parameters

| Name         | Type   | Description |
| ------------ | ------ | ----------- |
| params       | object |             |
| params.uid   | string |             |
| params.tag   | string |             |
| params?.memo | string |             |

### Result

| Name      | Type   | Description |
| --------- | ------ | ----------- |
| result    | array  |             |
| result[#] | string |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.assign_tag",
  "params": {
    "uid": "1001",
    "tag": "example-tag",
    "memo": "this is a tag memo"
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": [null]
}
```

<a name="conveyor.unassign_tag"></a>

## conveyor.unassign_tag

Remove tag from user.

### Description

_Authenticated: requires signature of admin account._

### Parameters

| Name       | Type   | Description |
| ---------- | ------ | ----------- |
| params     | object |             |
| params.uid | string |             |
| params.tag | string |             |

### Result

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| result | object |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.unassign_tag",
  "params": {
    "uid": "1001",
    "tag": "example-tag"
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": {}
}
```

<a name="conveyor.get_users_by_tags"></a>

## conveyor.get_users_by_tags

Get a list of users that has tags assigned.

### Description

tags can be either a string or an array of strings in which case the user must have all the tags givento be included in the response. _Authenticated: requires signature of an admin account._

### Parameters

| Name        | Type   | Description |
| ----------- | ------ | ----------- |
| params      | object |             |
| params.tags |        |             |

### Result

| Name      | Type   | Description |
| --------- | ------ | ----------- |
| result    | array  |             |
| result[#] | string |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.get_users_by_tags",
  "params": {}
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": ["1001"]
}
```

<a name="conveyor.get_tags_for_user"></a>

## conveyor.get_tags_for_user

Get a list of tags assigned to uid.

### Description

_Authenticated: requires signature of an admin account._

### Parameters

| Name         | Type    | Description |
| ------------ | ------- | ----------- |
| params       | object  |             |
| params.uid   | string  |             |
| params.audit | boolean |             |

### Result

| Name      | Type   | Description |
| --------- | ------ | ----------- |
| result    | array  |             |
| result[#] | string |             |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.get_tags_for_user",
  "params": {
    "uid": "1001",
    "audit": false
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": [null]
}
```

<a name="conveyor.get_account"></a>

## conveyor.get_account

### Description

_Authenticated: requires signature of an admin account._

### Parameters

| Name                 | Type   | Description                    |
| -------------------- | ------ | ------------------------------ |
| params               | object |                                |
| params.name          | string | earthshare blockchain account       |
| params?.user_context | string | the user performing the search |

### Result

| Name                         | Type    | Description                               |
| ---------------------------- | ------- | ----------------------------------------- |
| result                       | object  |                                           |
| result?.name                 | string  | earthshare blockchain account                  |
| result?.vote_sp              | number  | SP minus delegated away plus delegated to |
| result?.joined_at            | string  | account creation date                     |
| result?.reputation           | number  | legacy rep score (centered at 25)         |
| result?.context              | object  | relationship context                      |
| result?.context.recent_sends | integer | last 30d number of xfers to this acct     |
| result?.context.is_following | boolean | if ctx follows this user                  |
| result?.context.is_follower  | boolean | if ctx follows this user                  |
| result?.context.is_muted     | boolean | if ctx muted (ignored) this user          |
| result?.tags                 | array   | {abuse exchange verified none}            |
| result?.tags[#]              | string  |                                           |
| result?.value_sp             | number  | effective SP value of all held tokens     |
| result?.followers            | integer | follower count                            |
| result?.following            | integer | following count                           |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.get_account",
  "params": {
    "name": "earthshare",
    "user_context": "earthshare"
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": {
    "name": "earthshare",
    "vote_sp": 100.1,
    "joined_at": "2016-03-24T17:00",
    "reputation": 100,
    "context": {},
    "context.recent_sends": 100,
    "context.is_following": false,
    "context.is_follower": false,
    "context.is_muted": false,
    "tags": ["none"],
    "value_sp": 1000.1,
    "followers": 100,
    "following": 100
  }
}
```

<a name="conveyor.autocomplete_account"></a>

## conveyor.autocomplete_account

### Description

_Authenticated: requires signature of an admin account._

### Parameters

| Name                      | Type   | Description |
| ------------------------- | ------ | ----------- |
| params                    | object |             |
| params?.account_substring | string |             |

### Result

| Name                                    | Type    | Description                               |
| --------------------------------------- | ------- | ----------------------------------------- |
| result                                  | object  |                                           |
| result?.recent                          | array   | recently referenced accounts              |
| result?.recent[#]                       | object  |                                           |
| result?.recent[#]?.name                 | string  | earthshare blockchain account                  |
| result?.recent[#]?.vote_sp              | number  | SP minus delegated away plus delegated to |
| result?.recent[#]?.joined_at            | string  | account creation date                     |
| result?.recent[#]?.reputation           | number  | legacy rep score (centered at 25)         |
| result?.recent[#]?.context              | object  | relationship context                      |
| result?.recent[#]?.context.recent_sends | integer | last 30d number of xfers to this acct     |
| result?.recent[#]?.context.is_following | boolean | if ctx follows this user                  |
| result?.recent[#]?.context.is_follower  | boolean | if ctx follows this user                  |
| result?.recent[#]?.context.is_muted     | boolean | if ctx muted (ignored) this user          |
| result?.recent[#]?.tags                 | array   | {abuse exchange verified none}            |
| result?.recent[#]?.tags[#]              | string  |                                           |
| result?.recent[#]?.value_sp             | number  | effective SP value of all held tokens     |
| result?.recent[#]?.followers            | integer | follower count                            |
| result?.recent[#]?.following            | integer | following count                           |
| result?.friend                          | array   | friend accounts                           |
| result?.friend[#]                       | object  |                                           |
| result?.friend[#]?.name                 | string  | earthshare blockchain account                  |
| result?.friend[#]?.vote_sp              | number  | SP minus delegated away plus delegated to |
| result?.friend[#]?.joined_at            | string  | account creation date                     |
| result?.friend[#]?.reputation           | number  | legacy rep score (centered at 25)         |
| result?.friend[#]?.context              | object  | relationship context                      |
| result?.friend[#]?.context.recent_sends | integer | last 30d number of xfers to this acct     |
| result?.friend[#]?.context.is_following | boolean | if ctx follows this user                  |
| result?.friend[#]?.context.is_follower  | boolean | if ctx follows this user                  |
| result?.friend[#]?.context.is_muted     | boolean | if ctx muted (ignored) this user          |
| result?.friend[#]?.tags                 | array   | {abuse exchange verified none}            |
| result?.friend[#]?.tags[#]              | string  |                                           |
| result?.friend[#]?.value_sp             | number  | effective SP value of all held tokens     |
| result?.friend[#]?.followers            | integer | follower count                            |
| result?.friend[#]?.following            | integer | following count                           |
| result?.global                          | array   | all accounts                              |
| result?.global[#]                       | object  |                                           |
| result?.global[#]?.name                 | string  | earthshare blockchain account                  |
| result?.global[#]?.vote_sp              | number  | SP minus delegated away plus delegated to |
| result?.global[#]?.joined_at            | string  | account creation date                     |
| result?.global[#]?.reputation           | number  | legacy rep score (centered at 25)         |
| result?.global[#]?.context              | object  | relationship context                      |
| result?.global[#]?.context.recent_sends | integer | last 30d number of xfers to this acct     |
| result?.global[#]?.context.is_following | boolean | if ctx follows this user                  |
| result?.global[#]?.context.is_follower  | boolean | if ctx follows this user                  |
| result?.global[#]?.context.is_muted     | boolean | if ctx muted (ignored) this user          |
| result?.global[#]?.tags                 | array   | {abuse exchange verified none}            |
| result?.global[#]?.tags[#]              | string  |                                           |
| result?.global[#]?.value_sp             | number  | effective SP value of all held tokens     |
| result?.global[#]?.followers            | integer | follower count                            |
| result?.global[#]?.following            | integer | following count                           |

### Examples

#### Request

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "method": "conveyor.autocomplete_account",
  "params": {
    "account_substring": "ste"
  }
}
```

#### Response

```json
{
  "jsonrpc": "2.0",
  "id": "1234567890",
  "result": {
    "recent": [
      {
        "name": "earthshare",
        "vote_sp": 100.1,
        "joined_at": "2016-03-24T17:00",
        "reputation": 100,
        "context": {},
        "context.recent_sends": 100,
        "context.is_following": false,
        "context.is_follower": false,
        "context.is_muted": false,
        "tags": ["none"],
        "value_sp": 1000.1,
        "followers": 100,
        "following": 100
      }
    ],
    "friend": [
      {
        "name": "earthshare",
        "vote_sp": 100.1,
        "joined_at": "2016-03-24T17:00",
        "reputation": 100,
        "context": {},
        "context.recent_sends": 100,
        "context.is_following": false,
        "context.is_follower": false,
        "context.is_muted": false,
        "tags": ["none"],
        "value_sp": 1000.1,
        "followers": 100,
        "following": 100
      }
    ],
    "global": [
      {
        "name": "earthshare",
        "vote_sp": 100.1,
        "joined_at": "2016-03-24T17:00",
        "reputation": 100,
        "context": {},
        "context.recent_sends": 100,
        "context.is_following": false,
        "context.is_follower": false,
        "context.is_muted": false,
        "tags": ["none"],
        "value_sp": 1000.1,
        "followers": 100,
        "following": 100
      }
    ]
  }
}
```
