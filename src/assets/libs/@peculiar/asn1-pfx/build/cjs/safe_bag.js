"use strict";
var SafeContents_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeContents = exports.SafeBag = void 0;
const tslib_1 = require("tslib");
const asn1_schema_1 = require("@peculiar/asn1-schema");
const attribute_1 = require("./attribute");
class SafeBag {
    constructor(params = {}) {
        this.bagId = "";
        this.bagValue = new ArrayBuffer(0);
        Object.assign(this, params);
    }
}
tslib_1.__decorate([
    (0, asn1_schema_1.AsnProp)({ type: asn1_schema_1.AsnPropTypes.ObjectIdentifier })
], SafeBag.prototype, "bagId", void 0);
tslib_1.__decorate([
    (0, asn1_schema_1.AsnProp)({ type: asn1_schema_1.AsnPropTypes.Any, context: 0 })
], SafeBag.prototype, "bagValue", void 0);
tslib_1.__decorate([
    (0, asn1_schema_1.AsnProp)({ type: attribute_1.PKCS12Attribute, repeated: "set", optional: true })
], SafeBag.prototype, "bagAttributes", void 0);
exports.SafeBag = SafeBag;
let SafeContents = SafeContents_1 = class SafeContents extends asn1_schema_1.AsnArray {
    constructor(items) {
        super(items);
        Object.setPrototypeOf(this, SafeContents_1.prototype);
    }
};
SafeContents = SafeContents_1 = tslib_1.__decorate([
    (0, asn1_schema_1.AsnType)({ type: asn1_schema_1.AsnTypeTypes.Sequence, itemType: SafeBag })
], SafeContents);
exports.SafeContents = SafeContents;
