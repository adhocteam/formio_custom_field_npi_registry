/**
 * This file shows how to create a custom component.
 *
 * Get the base component class by referencing Formio.Components.components map.
 */
import {Components} from 'formiojs';

const FieldComponent = (Components as any).components.field;
import editForm from './NpiRegistry.form';
import {log} from 'util';

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
    private results: any[];
    private fieldMap: string[] = ['firstName', 'lastName', 'npi', 'street', 'city', 'state', 'zip'];
    private sortFieldAscending: any[];
    private table: HTMLTableElement;
    private selectedNumber: string;
    private timeout;

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
            ref: `${this.component.key}`,
            sortTable: this.sortTable,
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
        const textFields = ['number', 'first_name', 'last_name', 'city', 'postal_code'];
        const selectFields = ['enumeration_type', 'state', 'address_type'];
        [...textFields, ...selectFields, 'results'].forEach(field => {
            refs[`${this.component.key}_${field}`] = 'multiple';
        });
        refs[`${this.component.key}_spinner`] = 'multiple';
        this.loadRefs(element, refs);

        // add event listeners
        textFields.forEach(field => {
            this.addEventListener(this.refs[`${this.component.key}_${field}`][0], 'keyup', (e) => this.inputHandler(e));
        });
        selectFields.forEach(field => {
            this.addEventListener(this.refs[`${this.component.key}_${field}`][0], 'change', (e) => this.inputHandler(e));
        });

        this.table = this.refs[`${this.component.key}_results`][0];
        const ths = this.table.getElementsByTagName('th');
        Array.from(ths).forEach((th, i) => {
            this.addEventListener(th, 'click', () => this.renderList(this.sortResults(this.results, i)))
        });

        return super.attach(element);
    }

    private inputHandler(e) {
        const nodeValue = e.target.attributes[0].nodeValue;
        const fieldNameArray = nodeValue.split('_');
        const fieldName = fieldNameArray.slice(1, fieldNameArray.length).join('_');
        this.data[fieldName] = e.target.value;
        delete this.data.submit;
        clearTimeout(this.timeout);

        this.timeout = setTimeout(() => this.queryNPI(this.data), 500);
    }

    private queryNPI(params) {
        this.sortFieldAscending = [null, null, null, null, null, null, null];
        const url = new URL('https://npiregistry.cms.hhs.gov/api/');
        url.search = new URLSearchParams({...params, version: '2.1', limit: 200}).toString();
        this.table.style.visibility = 'hidden';
        this.refs[`${this.component.key}_spinner`][0].style.visibility = 'visible';
        fetch(`https://cors-anywhere.herokuapp.com/${url.toString()}`)
            .then(response => response.json())
            .then(data => this.renderList(this.sortResults(this.destructureResults(data.results), 1)))
            .catch(resp => {
                console.error(resp);
            });
    }

    private destructureResults(results) {
        // @ts-ignore
        return results.map(({addresses, basic, number}) => (
            {
                firstName: basic.first_name,
                lastName: basic.last_name,
                npi: number,
                street: addresses[0].address_1,
                city: addresses[0].city,
                state: addresses[0].state,
                zip: addresses[0].postal_code.substring(0, 5),
            }
        ));
    }

    private sortResults(results, index) {
        const currentValue = this.sortFieldAscending[index];
        let newValue;
        if (currentValue === null) {
            newValue = 1;
        } else {
            newValue = currentValue * -1;
        }
        this.sortFieldAscending = [null, null, null, null, null, null, null];
        this.sortFieldAscending[index] = newValue;
        console.log(this.sortFieldAscending[index]);
        const field = this.fieldMap[index];
        this.results = results.sort((a, b) => (a[field] > b[field]) ? this.sortFieldAscending[index] : -this.sortFieldAscending[index]);
        return results;
    }

    private renderList(results) {
        this.refs[`${this.component.key}_spinner`][0].style.visibility = 'hidden';
        this.table.style.visibility = 'visible';

        const tableBody = this.table.getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';
        results.forEach((result) => {
            const newTr = `<tr><td>${result.firstName}</td><td>${result.lastName}</td><td>${result.npi}</td><td>${result.street}</td><td>${result.city}</td><td>${result.state}</td><td>${result.zip}</td></tr>`;
            const newRow = tableBody.insertRow(tableBody.rows.length);
            newRow.innerHTML = newTr;
            this.addEventListener(newRow, 'click', (e) => {
                const trs = this.table.getElementsByTagName('tr');
                Array.from(trs).map((tr) => tr.classList.remove('table-info'));
                e.currentTarget.classList.add('table-info');
                this.selectedNumber = result.npi;
                this.updateValue();
            });
        });
    }

    /**
     * Get the value of the component from the dom elements.
     *
     * @returns {Array}
     */
    getValue() {
        return this.selectedNumber;
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
