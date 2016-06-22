export default ngModule => {
  require('./igUtils')(ngModule);
  require('./mappingService')(ngModule);
  require('./persistenceService')(ngModule);
  require('./navigationService')(ngModule);
  require('./dialogService')(ngModule);
  require('./endPointLocatorService')(ngModule);
  require('./httpSessionService')(ngModule);
};
