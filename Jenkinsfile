def gitUrl = 'https://github.com/ChomCHOB/tyk-gateway-updater'
def gitBranch = 'refs/heads/master'

node('master') {
  stage('build docker image') {
    def buildParameters = [
      string(name: 'GIT_URL', value: gitUrl), 
      string(name: 'GIT_BRANCH', value: gitBranch), 

      booleanParam(name: 'BUILD_DOCKER_IMAGE', value: true),
      booleanParam(name: 'PUBLISH_TO_DOCKER_HUB', value: true),
      booleanParam(name: 'PUBLISH_LATEST', value: true),
    ]

    // build
    build(
      job: '../../deploy-pipeline', 
      parameters: buildParameters
    )
  }
}