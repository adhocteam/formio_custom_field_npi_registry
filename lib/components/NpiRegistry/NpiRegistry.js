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
    NpiRegistry.prototype.renderCell = function (row, col) {
        return this.renderTemplate('input', {
            input: {
                type: 'input',
                ref: this.component.key + "-" + row,
                attr: {
                    id: this.component.key + "-" + row + "-" + col,
                    class: 'form-control',
                    type: 'checkbox',
                }
            }
        });
    };
    NpiRegistry.prototype.render = function (children) {
        return _super.prototype.render.call(this, this.renderTemplate('npiregistry', {
            tableClass: this.tableClass,
            renderCell: this.renderCell.bind(this)
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
        // const refs = {};
        //
        // for (let i = 0; i < this.component.numRows; i++) {
        //     refs[`${this.component.key}`] = 'multiple';
        // }
        //
        // this.loadRefs(element, refs);
        //
        // this.checks = Array.prototype.slice.call(this.refs[`${this.component.key}`], 0);
        //
        // // Attach click events to each input in the row
        // this.checks.forEach(input => {
        //     this.addEventListener(input, 'click', () => this.funk())
        // });
        // Allow basic component functionality to attach like field logic and tooltips.
        return _super.prototype.attach.call(this, element);
    };
    NpiRegistry.prototype.funk = function () {
        this.updateValue();
    };
    /**
     * Get the value of the component from the dom elements.
     *
     * @returns {Array}
     */
    NpiRegistry.prototype.getValue = function () {
        // const el = (document.getElementById('credit_card') as HTMLSelectElement);
        // const value = el.options[el.selectedIndex].value;
        var selectElement = this.refs["" + this.component.key][0];
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
        if (!value) {
            return;
        }
        for (var rowIndex in this.checks) {
            var row = this.checks[rowIndex];
            if (!value[rowIndex]) {
                break;
            }
            for (var colIndex in row) {
                var col = row[colIndex];
                if (!value[rowIndex][colIndex]) {
                    return false;
                }
                var checked = value[rowIndex][colIndex] ? 1 : 0;
                col.value = checked;
                col.checked = checked;
            }
        }
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
