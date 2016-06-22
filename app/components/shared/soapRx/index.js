export default ngModule => {
  require('./responseParser')(ngModule)
  require('./soapRx')(ngModule)
}
