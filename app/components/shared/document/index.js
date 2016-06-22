export default ngModule => { 
  require('./listDocuments')(ngModule)
  require('./getDocuments')(ngModule)
  require('./documentService')(ngModule)
}