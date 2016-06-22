
module.exports = angular.module("igApp.constants", [])

.constant("LOG_ON_RESPONSE", "/services/logonresponse.json")

.constant("INSPECTIONS_END_POINT", "http://tcts4.con-way.com/services/inspection")

.constant("DMS_END_POINT", "/components/shared/camera/dms_photos.json")

.constant("USER_LOGIN_ENDPOINT", "http://tcts4.con-way.com/services/freightmovement/scosetup/user")

.constant("PRICING_APP_ENDPOINT", "http://tcts4.con-way.com/webapp/pricing_app")

.constant("CORRECTIONS_APP_ENDPOINT", "http://tcts4.con-way.com/webapp/corrections_app")

.constant("INSPECTIONS_APP_ENDPOINT", "http://tcts4.con-way.com/webapp/inspection_app")

.constant("CORP_CODE", "DEMO")

.constant("TWM_END_POINT", "wss://twmctsc.con-way.com:15443/jms")

.constant("TWM_CONFIG", {
	"twmCicsRegion": "CONWAY.CTS.CTSC.S2C",
	"twmDestination": "InspectorDeviceEvents",
	"twmResponseQueue": "InspectorDeviceResponseEvents"
})

.constant("ENVIRONMENT", "development")

.constant("GET_DOCS_ENDPOINT", "http://dms.con-way.com:8080/DMS/services/GetDmsDoc.GetDmsDocHttpSoap11Endpoint/")

.constant("GET_DOCS_WSDL_ENDPOINT", "http://dms.con-way.com:8080/DMS/services/GetDmsDoc?wsdl")

.constant("LIST_DOCS_ENDPOINT", "http://dms.con-way.com:8080/DMS/services/OneCorpLocateDmsDoc.OneCorpLocateDmsDocHttpSoap11Endpoint/")

.constant("LIST_DOCS_WSDL_ENDPOINT", "http://dms.con-way.com:8080/DMS/services/OneCorpLocateDmsDoc?wsdl")

.constant("CODE_CONSTANTS", {
	"INSPECT_STATUS": {
		"R": "Flagged",
		"P": "In Progress",
		"I": "Inspected",
		"X": "Dismissed",
		"N": "Inspected Not Corrected",
		"Y": "Recommended",
		"T": "Corrected",
		"NONE": "No Status"
	},
	"SHIFT_CODE": {
		"O": "Outbound",
		"I": "Inbound",
		"N": "FAC",
		"D": "Day Reship"
	},
	"PREFERENCES": {
		"LIST_I": "I-dtColumnsPref"
	},
	"MAX_INSPECT_DIMS": 50,
	"DOCUMENT_DISPLAY": {
		"BILL_OF_LADING": "BL",
		"BL_ATTATCHMENT": "BLAT",
		"CUSTOMS_DOC": "CUST",
		"NMFC_CLASS_INSP_CERT": "NCIC",
		"WT_INSP_CERT": "WI",
		"WT_INSP_PHOTO": "WRFO"
	},
	"DOCUMENT_CODES": [
		"BL",
		"BLAT",
		"CUST",
		"NCIC",
		"WI"
	],
	"ARCHIVED_DOCUMENTS_PERSISTENCE_NAME": "ARCHIVED_DOCS",
	"FEEDBACK_CATEGORIES": [
		"Inspection App",
		"Device",
		"Training",
		"New Feature",
		"Other"
	],
	"NO_NETWORK_CONN": -1,
	"SERVER_ERROR_HTML": "Server Error 500"
})

;
