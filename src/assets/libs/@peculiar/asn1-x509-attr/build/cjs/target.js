"use strict";
var Targets_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Targets = exports.Target = exports.TargetCert = void 0;
const tslib_1 = require("tslib");
const asn1_schema_1 = require("@peculiar/asn1-schema");
const asn1_x509_1 = require("@peculiar/asn1-x509");
const issuer_serial_1 = require("./issuer_serial");
const object_digest_info_1 = require("./object_digest_info");
class TargetCert {
    constructor(params = {}) {
        this.targetCertificate = new issuer_serial_1.IssuerSerial();
        Object.assign(this, params);
    }
}
tslib_1.__decorate([
    (0, asn1_schema_1.AsnProp)({ type: issuer_serial_1.IssuerSerial })
], TargetCert.prototype, "targetCertificate", void 0);
tslib_1.__decorate([
    (0, asn1_schema_1.AsnProp)({ type: asn1_x509_1.GeneralName, optional: true })
], TargetCert.prototype, "targetName", void 0);
tslib_1.__decorate([
    (0, asn1_schema_1.AsnProp)({ type: object_digest_info_1.ObjectDigestInfo, optional: true })
], TargetCert.prototype, "certDigestInfo", void 0);
exports.TargetCert = TargetCert;
let Target = class Target {
    constructor(params = {}) {
        Object.assign(this, params);
    }
};
tslib_1.__decorate([
    (0, asn1_schema_1.AsnProp)({ type: asn1_x509_1.GeneralName, context: 0, implicit: true })
], Target.prototype, "targetName", void 0);
tslib_1.__decorate([
    (0, asn1_schema_1.AsnProp)({ type: asn1_x509_1.GeneralName, context: 1, implicit: true })
], Target.prototype, "targetGroup", void 0);
tslib_1.__decorate([
    (0, asn1_schema_1.AsnProp)({ type: TargetCert, context: 2, implicit: true })
], Target.prototype, "targetCert", void 0);
Target = tslib_1.__decorate([
    (0, asn1_schema_1.AsnType)({ type: asn1_schema_1.AsnTypeTypes.Choice })
], Target);
exports.Target = Target;
let Targets = Targets_1 = class Targets extends asn1_schema_1.AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, Targets_1.prototype);
    }
};
Targets = Targets_1 = tslib_1.__decorate([
    (0, asn1_schema_1.AsnType)({ type: asn1_schema_1.AsnTypeTypes.Sequence, itemType: Target })
], Targets);
exports.Targets = Targets;
