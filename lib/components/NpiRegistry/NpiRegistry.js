var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
/**
 * This file shows how to create a custom component.
 *
 * Get the base component class by referencing Formio.Components.components map.
 */
import { Components } from 'formiojs';
var FieldComponent = Components.components.field;
import editForm from './NpiRegistry.form';
/**
 * Here we will derive from the base component which all Form.io form components derive from.
 *
 * @param component
 * @param options
 * @param data
 * @constructor
 */
var NpiRegistry = /** @class */ (function (_super) {
    __extends(NpiRegistry, _super);
    function NpiRegistry(component, options, data) {
        var _this = _super.call(this, component, options, data) || this;
        _this.data = {};
        _this.checks = [];
        return _this;
    }
    NpiRegistry.schema = function () {
        return FieldComponent.schema({
            type: 'npiregistry',
            numRows: 1,
            numCols: 1
        });
    };
    Object.defineProperty(NpiRegistry.prototype, "tableClass", {
        get: function () {
            var _this = this;
            var tableClass = 'table ';
            ['striped', 'bordered', 'hover', 'condensed'].forEach(function (prop) {
                if (_this.component[prop]) {
                    tableClass += "table-" + prop + " ";
                }
            });
            return tableClass;
        },
        enumerable: true,
        configurable: true
    });
    NpiRegistry.prototype.render = function (children) {
        return _super.prototype.render.call(this, this.renderTemplate('npiregistry', {
            ref: "" + this.component.key
        }));
    };
    /**
     * After the html string has been mounted into the dom, the dom element is returned here. Use refs to find specific
     * elements to attach functionality to.
     *
     * @param element
     * @returns {Promise}
     */
    NpiRegistry.prototype.attach = function (element) {
        var _this = this;
        // load refs
        var refs = {};
        var textFields = ['first-name', 'last-name', 'city', 'postal-code'];
        var selectFields = ['state', 'address-type'];
        __spreadArrays(textFields, selectFields, ['results']).forEach(function (field) {
            refs[_this.component.key + "-" + field] = 'multiple';
        });
        this.loadRefs(element, refs);
        // add event listeners
        textFields.forEach(function (field) {
            _this.addEventListener(_this.refs[_this.component.key + "-" + field][0], 'keyup', function (e) { return _this.inputHandler(e); });
        });
        selectFields.forEach(function (field) {
            _this.addEventListener(_this.refs[_this.component.key + "-" + field][0], 'change', function (e) { return _this.inputHandler(e); });
        });
        this.addEventListener(this.refs[this.component.key + "-results"][0], 'click', function () { return _this.updateValue(); });
        return _super.prototype.attach.call(this, element);
    };
    NpiRegistry.prototype.inputHandler = function (e) {
        var nodeValue = e.target.attributes[0].nodeValue;
        var fieldNameArray = nodeValue.split('-');
        var fieldName = fieldNameArray.slice(1, fieldNameArray.length).join('_');
        this.data[fieldName] = e.target.value;
        delete this.data.submit;
        // @ts-ignore
        if (Object.values(this.data).find(function (v) { return v.length >= 3; }) != null) {
            this.queryNPI(this.data);
        }
    };
    NpiRegistry.prototype.queryNPI = function (params) {
        var _this = this;
        var url = new URL('https://npiregistry.cms.hhs.gov/api/');
        url.search = new URLSearchParams(__assign(__assign({}, params), { version: '2.1' })).toString();
        fetch("https://cors-anywhere.herokuapp.com/" + url.toString())
            .then(function (response) { return response.json(); })
            .then(function (data) { return _this.showList(data); })
            .catch(function (resp) {
            console.error(resp);
        });
    };
    NpiRegistry.prototype.orBlank = function (value) {
        return value || '';
    };
    NpiRegistry.prototype.showList = function (data) {
        var select = this.refs[this.component.key + "-results"][0];
        select.options.length = 0;
        if (data.result_count >= 1) {
            // tslint:disable-next-line:variable-name
            var optionsData = data.results.map(function (_a) {
                var addresses = _a.addresses, basic = _a.basic, number = _a.number;
                return ({
                    firstName: basic.first_name,
                    lastName: basic.last_name,
                    address: addresses[0].address_1 + ", " + addresses[0].city + ", " + addresses[0].state,
                    number: number
                });
            });
            optionsData.forEach(function (o, i) {
                select.options[select.options.length] = new Option(o.firstName + " " + o.lastName + " : " + o.address + " : " + o.number, o.number);
            });
        }
    };
    /**
     * Get the value of the component from the dom elements.
     *
     * @returns {Array}
     */
    NpiRegistry.prototype.getValue = function () {
        var selectElement = this.refs[this.component.key + "-results"][0];
        var value = selectElement.options[selectElement.selectedIndex].value;
        return value;
    };
    /**
     * Set the value of the component into the dom elements.
     *
     * @param value
     * @returns {boolean}
     */
    NpiRegistry.prototype.setValue = function (value) {
        // console.log("setValue");
    };
    NpiRegistry.editForm = editForm;
    NpiRegistry.builderInfo = {
        title: 'NPI Registry',
        group: 'basic',
        icon: 'fa fa-doctor',
        weight: 70,
        documentation: 'http://help.form.io/userguide/#table',
        schema: NpiRegistry.schema()
    };
    return NpiRegistry;
}(FieldComponent));
export default NpiRegistry;
