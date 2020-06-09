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
        this.queryNPI(this.data);
    };
    NpiRegistry.prototype.queryNPI = function (data) {
        var url = "https://npiregistry.cms.hhs.gov/api/?first_name=" + this.orBlank(this.data.first_name) + "&last_name=" + this.orBlank(this.data.last_name) + "&city=" + this.orBlank(this.data.city) + "&state=" + this.orBlank(this.data.state) + "&postal_code=" + this.orBlank(this.data.postal_code) + "&version=2.1";
        console.log(url);
        console.log(data);
    };
    NpiRegistry.prototype.orBlank = function (value) {
        return value || '';
    };
    /**
     * Get the value of the component from the dom elements.
     *
     * @returns {Array}
     */
    NpiRegistry.prototype.getValue = function () {
        // const el = (document.getElementById('credit_card') as HTMLSelectElement);
        // const value = el.options[el.selectedIndex].value;
        var selectElement = this.refs[this.component.key + "-results"][0];
        var value = selectElement.options[selectElement.selectedIndex].value;
        console.log(value);
        return value;
    };
    /**
     * Set the value of the component into the dom elements.
     *
     * @param value
     * @returns {boolean}
     */
    NpiRegistry.prototype.setValue = function (value) {
        console.log("setValue");
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
