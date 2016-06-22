import logDecorator from './logDecorator'

export default /* @ngInject */ function registerAppDecorators($provide) {
  logDecorator($provide);
}
