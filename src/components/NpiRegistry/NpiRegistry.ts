/**
 * This file shows how to create a custom component.
 *
 * Get the base component class by referencing Formio.Components.components map.
 */
import {Components} from 'formiojs';

const FieldComponent = (Components as any).components.field;
import editForm from './NpiRegistry.form';

/**
 * Here we will derive from the base component which all Form.io form components derive from.
 *
 * @param component
 * @param options
 * @param data
 * @constructor
 */
export default class NpiRegistry extends (FieldComponent as any) {
    public data: any = {};

    constructor(component, options, data) {
        super(component, options, data);
        this.checks = [];
    }

    static schema() {
        return FieldComponent.schema({
            type: 'npiregistry',
            numRows: 1,
            numCols: 1
        });
    }

    public static editForm = editForm;

    static builderInfo = {
        title: 'NPI Registry',
        group: 'basic',
        icon: 'fa fa-doctor',
        weight: 70,
        documentation: 'http://help.form.io/userguide/#table',
        schema: NpiRegistry.schema()
    }

    get tableClass() {
        let tableClass = 'table ';
        ['striped', 'bordered', 'hover', 'condensed'].forEach((prop) => {
            if (this.component[prop]) {
                tableClass += `table-${prop} `;
            }
        });
        return tableClass;
    }

    public render(children) {
        return super.render(this.renderTemplate('npiregistry', {
            ref: `${this.component.key}`
        }));
    }

    /**
     * After the html string has been mounted into the dom, the dom element is returned here. Use refs to find specific
     * elements to attach functionality to.
     *
     * @param element
     * @returns {Promise}
     */
    attach(element) {
        // load refs
        const refs = {};
        const textFields = ['first-name', 'last-name', 'city', 'postal-code'];
        const selectFields = ['state', 'address-type'];
        [...textFields, ...selectFields, 'results'].forEach(field => {
            refs[`${this.component.key}-${field}`] = 'multiple';
        });
        this.loadRefs(element, refs);

        // add event listeners
        textFields.forEach(field => {
            this.addEventListener(this.refs[`${this.component.key}-${field}`][0], 'keyup', (e) => this.inputHandler(e));
        });
        selectFields.forEach(field => {
            this.addEventListener(this.refs[`${this.component.key}-${field}`][0], 'change', (e) => this.inputHandler(e));
        });
        this.addEventListener(this.refs[`${this.component.key}-results`][0], 'click', () => this.updateValue());

        return super.attach(element);
    }

    private inputHandler(e) {
        const nodeValue = e.target.attributes[0].nodeValue;
        const fieldNameArray = nodeValue.split('-');
        const fieldName = fieldNameArray.slice(1, fieldNameArray.length).join('_');
        this.data[fieldName] = e.target.value;
        this.queryNPI(this.data);
    }

    private queryNPI(data) {
        const url = `https://npiregistry.cms.hhs.gov/api/?first_name=${this.orBlank(this.data.first_name)}&last_name=${this.orBlank(this.data.last_name)}&city=${this.orBlank(this.data.city)}&state=${this.orBlank(this.data.state)}&postal_code=${this.orBlank(this.data.postal_code)}&version=2.1`;
        console.log(url);
        console.log(data);
    }

    private orBlank(value) {
        return value || '';
    }

    /**
     * Get the value of the component from the dom elements.
     *
     * @returns {Array}
     */
    getValue() {
        // const el = (document.getElementById('credit_card') as HTMLSelectElement);
        // const value = el.options[el.selectedIndex].value;
        const selectElement = (this.refs[`${this.component.key}-results`][0] as HTMLSelectElement);
        const value = selectElement.options[selectElement.selectedIndex].value;
        console.log(value);
        return value;
    }

    /**
     * Set the value of the component into the dom elements.
     *
     * @param value
     * @returns {boolean}
     */
    setValue(value) {
        console.log("setValue");
    }
}
