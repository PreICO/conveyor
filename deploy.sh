#!/usr/bin/env sh

SERVICE=conveyor

[ ! -z ${CONVEYOR_USER} ] || CONVEYOR_USER=${SERVICE}d
[ ! -z ${CONVEYOR_HOME} ] || CONVEYOR_HOME=/usr/local/${SERVICE}d
[ ! -z ${CONVEYOR_PORT} ] || CONVEYOR_PORT=8060
[ ! -z ${CONVEYOR_DOCKER_HOST} ] || CONVEYOR_DOCKER_HOST=unix:///var/run/docker.sock
[ ! -z ${CONVEYOR_DATABASE_SCHEME} ] || CONVEYOR_DATABASE_SCHEME=postgres
[ ! -z ${CONVEYOR_DATABASE_HOST} ] || CONVEYOR_DATABASE_HOST=conveyor-db
[ ! -z ${CONVEYOR_DATABASE_PORT} ] || CONVEYOR_DATABASE_PORT=5432
[ ! -z ${CONVEYOR_DATABASE_USER} ] || CONVEYOR_DATABASE_USER=conveyor
[ ! -z ${CONVEYOR_DATABASE_DATABASE} ] || CONVEYOR_DATABASE_DATABASE=conveyor

WORKTREE=`dirname \`realpath ${0}\``
SERVICE_REPO=${SUDO_USER}/${PROJECT}_${SERVICE}
STAGE0=${SERVICE_REPO}_stage0
CONVEYOR_GIT_REV=`cd ${WORKTREE} && git rev-parse HEAD`
STAGE1=${SERVICE_REPO}:${CONVEYOR_GIT_REV}
STAGE_LATEST=${SERVICE_REPO}:latest
DIRTY=`cd ${WORKTREE} && git status -s`

mkdir -p \
    ${WORKTREE}/node_modules \
    ${WORKTREE}/lib && \
chown \
    -R \
    ${SUDO_UID}:${SUDO_GID} \
    ${WORKTREE}/node_modules \
    ${WORKTREE}/lib && \
([ -z "${DIRTY}" ] && buildah inspect ${STAGE1} > /dev/null 2> /dev/null || \
 (buildah inspect ${STAGE0} > /dev/null 2> /dev/null || \
  buildah from \
      --name ${STAGE0} \
      node:8.7-stretch) && \
 buildah config \
     -u root \
     --workingdir ${WORKTREE} \
     ${STAGE0} && \
 buildah run \
     ${STAGE0} \
     /usr/bin/env \
         -u USER \
         -u HOME \
         sh -c -- \
            "apt update && \
             apt upgrade -y" && \
 buildah run \
     --user ${SUDO_UID}:${SUDO_GID} \
     -v ${WORKTREE}/package.json:/usr/src/${SERVICE}/package.json:ro \
     -v ${WORKTREE}/yarn.lock:/usr/src/${SERVICE}/yarn.lock:ro \
     -v ${WORKTREE}/../dsteem:/usr/src/dsteem:ro \
     -v ${WORKTREE}/node_modules:/usr/src/${SERVICE}/node_modules \
     ${STAGE0} \
     /usr/bin/env \
         -u USER \
         -u HOME \
         sh -c -- \
            "cd /usr/src/${SERVICE} && \
             NODE_ENV=development \
             yarn install \
                 --non-interactive \
                 --pure-lockfile" && \
 buildah run \
     --user ${SUDO_UID}:${SUDO_GID} \
     -v ${WORKTREE}:/usr/src/${SERVICE}:ro \
     -v ${WORKTREE}/../dsteem:/usr/src/dsteem:ro \
     -v ${WORKTREE}/lib:/usr/src/${SERVICE}/lib \
     ${STAGE0} \
     /usr/bin/env \
         -u USER \
         -u HOME \
         sh -c -- \
            "cd /usr/src/${SERVICE} && \
             NODE_ENV=production yarn run build" && \
 buildah run \
     -v ${WORKTREE}:/usr/src/${SERVICE}:ro \
     ${STAGE0} \
     /usr/bin/env \
         -u USER \
         -u HOME \
         sh -c -- \
            "adduser \
                 --system \
                 --home ${CONVEYOR_HOME} \
                 --shell /bin/bash \
                 --group \
                 --disabled-password \
                 ${CONVEYOR_USER} && \
             rm -rf ${CONVEYOR_HOME} && \
             cp \
                 -PRT \
                 /usr/src/${SERVICE} \
                 ${CONVEYOR_HOME}" && \
 buildah config \
     -e USER=${CONVEYOR_USER} \
     -e HOME=${CONVEYOR_HOME} \
     -e PORT=${CONVEYOR_PORT} \
     -e NODE_ENV=production \
     -e DATABASE_DIALECT=${CONVEYOR_DATABASE_SCHEME} \
     -e DATABASE_HOST=${CONVEYOR_DATABASE_HOST} \
     -e DATABASE_PORT=${CONVEYOR_DATABASE_PORT} \
     -e DATABASE_USERNAME=${CONVEYOR_DATABASE_USER} \
     -e DATABASE_PASSWORD=${CONVEYOR_DATABASE_PASSWORD} \
     -e DATABASE_NAME=${CONVEYOR_DATABASE_DATABASE} \
     --cmd "node lib/server.js" \
     -p ${CONVEYOR_PORT} \
     -u ${CONVEYOR_USER} \
     --workingdir ${CONVEYOR_HOME} \
     ${STAGE0} && \
 buildah commit \
     ${STAGE0} \
     ${STAGE1} &&
 buildah tag \
     ${STAGE1} \
     ${STAGE_LATEST} &&
 buildah push \
     --dest-daemon-host ${CONVEYOR_DOCKER_HOST} \
     ${STAGE1} \
     docker-daemon:${STAGE1} &&
 docker \
     -H ${CONVEYOR_DOCKER_HOST} \
     tag \
         ${STAGE1} \
         ${STAGE_LATEST})
