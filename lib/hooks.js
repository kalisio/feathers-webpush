import _ from 'lodash'
import makeDebug from 'debug'

const debug = makeDebug('feathers-webpush:hooks')

export async function deleteExpiredSubscriptions (hook) {
  if (hook.type !== 'after') {
    throw new Error('The \'deleteExpiredSubscriptions\' hook should only be used as a \'after\' hook.')
  }
  const app = hook.app
  const subscriptionService = hook.result.subscriptionService
  const resultFailed = hook.result.failed
  const subscriptionProperty = hook.result.subscriptionProperty
  const users = await app.service(subscriptionService).find({ paginate: false })

  _.forEach(resultFailed, async endpoint => {
    _.forEach(users, async user => {
      if (_.has(user, subscriptionProperty) && _.find(_.get(user, subscriptionProperty), subscription => subscription.endpoint === endpoint)) {
        // Patch subscriptions
        _.set(user, subscriptionProperty, _.filter(_.get(user, subscriptionProperty, []), subscription => subscription.endpoint !== endpoint))
        const newSubscriptionProperty = {}
        newSubscriptionProperty[subscriptionProperty] = _.get(user, subscriptionProperty)
        app.service(subscriptionService).patch(user._id, newSubscriptionProperty)
        hook.result.failed = _.remove(hook.result.failed, failed => { return failed !== endpoint })
        debug(`Delete subscription with endpoint ${endpoint} for user ${user._id}`)
      }
    })
  })
  return hook
}
