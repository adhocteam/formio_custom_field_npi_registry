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
    };

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
        delete this.data.submit;
        // @ts-ignore
        if (Object.values(this.data).find(v => v.length >= 3) != null) {
            this.queryNPI(this.data);
        }
    }

    private queryNPI(params) {
        const url = new URL('https://npiregistry.cms.hhs.gov/api/');
        url.search = new URLSearchParams({...params, version: '2.1'}).toString();
        fetch(`https://cors-anywhere.herokuapp.com/${url.toString()}`)
            .then(response => response.json())
            .then(data => this.showList(data))
            .catch(resp => {
                console.error(resp);
            });
    }

    private showList(data) {
        const select = this.refs[`${this.component.key}-results`][0];
        select.options.length = 0;
        if (data.result_count >= 1) {
            // tslint:disable-next-line:variable-name
            const optionsData = data.results.map(({addresses, basic, number}) => ({
                firstName: basic.first_name,
                lastName: basic.last_name,
                address: `${addresses[0].address_1}, ${addresses[0].city}, ${addresses[0].state}`,
                number
            }));
            optionsData.forEach(
                (o, i) => {
                    select.options[select.options.length] = new Option(`${o.firstName} ${o.lastName} : ${o.address} : ${o.number}`, o.number)
                }
            )
        }
    }

    /**
     * Get the value of the component from the dom elements.
     *
     * @returns {Array}
     */
    getValue() {
        const selectElement = (this.refs[`${this.component.key}-results`][0] as HTMLSelectElement);
        const value = selectElement.options[selectElement.selectedIndex].value;
        return value;
    }

    /**
     * Set the value of the component into the dom elements.
     *
     * @param value
     * @returns {boolean}
     */
    setValue(value) {
        // console.log("setValue");
    }
}
