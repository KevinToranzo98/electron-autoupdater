"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignerIdentifier = void 0;
const tslib_1 = require("tslib");
const asn1_schema_1 = require("@peculiar/asn1-schema");
const issuer_and_serial_number_1 = require("./issuer_and_serial_number");
const asn1_x509_1 = require("@peculiar/asn1-x509");
let SignerIdentifier = class SignerIdentifier {
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
tslib_1.__decorate([
    (0, asn1_schema_1.AsnProp)({ type: asn1_x509_1.SubjectKeyIdentifier, context: 0, implicit: true })
], SignerIdentifier.prototype, "subjectKeyIdentifier", void 0);
tslib_1.__decorate([
    (0, asn1_schema_1.AsnProp)({ type: issuer_and_serial_number_1.IssuerAndSerialNumber })
], SignerIdentifier.prototype, "issuerAndSerialNumber", void 0);
SignerIdentifier = tslib_1.__decorate([
    (0, asn1_schema_1.AsnType)({ type: asn1_schema_1.AsnTypeTypes.Choice })
], SignerIdentifier);
exports.SignerIdentifier = SignerIdentifier;
