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
    private table: HTMLTableElement;
    private selectedNumber : string;

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

        return super.attach(element);
    }

    private inputHandler(e) {
        const nodeValue = e.target.attributes[0].nodeValue;
        const fieldNameArray = nodeValue.split('_');
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
        this.table.style.visibility = 'hidden';
        this.refs[`${this.component.key}_spinner`][0].style.visibility = 'visible';
        fetch(`https://cors-anywhere.herokuapp.com/${url.toString()}`)
            .then(response => response.json())
            .then(data => this.showList(data))
            .catch(resp => {
                console.error(resp);
            });
    }

    private showList(data) {
        this.refs[`${this.component.key}_spinner`][0].style.visibility = 'hidden';
        this.table.style.visibility = 'visible';

        const ths = this.table.getElementsByTagName('th');
        Array.from(ths).forEach((th, i) => {
            this.addEventListener(th, 'click', () => this.sortTable(i))
        });

        const tableBody = this.table.getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';

        data.results.forEach(({addresses, basic, number}) => {
            const newTr = `<tr><td>${basic.first_name}</td><td>${basic.last_name}</td><td>${number}</td><td>${addresses[0].address_1}</td><td>${addresses[0].city}</td><td>${addresses[0].state}</td><td>${addresses[0].postal_code.substring(0,5)}</td></tr>`;
            const newRow = tableBody.insertRow(tableBody.rows.length);
            newRow.innerHTML = newTr;
            this.addEventListener(newRow, 'click', (e) => {
                const trs = this.table.getElementsByTagName('tr');
                Array.from(trs).map((tr) => tr.classList.remove('table-warning'));
                e.currentTarget.classList.add('table-warning');
                this.selectedNumber = number;
                this.updateValue();
            });
        });
    }

    public sortTable(n) {
        let rows;
        let switching;
        let i;
        let x;
        let y;
        let shouldSwitch;
        let dir;
        let switchcount = 0;
        switching = true;
        // Set the sorting direction to ascending:
        dir = 'asc';
        /* Make a loop that will continue until
        no switching has been done: */
        while (switching && this.table != null) {
            // Start by saying: no switching is done:
            switching = false;
            rows = this.table.rows;
            /* Loop through all table rows (except the
            first, which contains table headers): */
            for (i = 1; i < (rows.length - 1); i++) {
                // Start by saying there should be no switching:
                shouldSwitch = false;
                /* Get the two elements you want to compare,
                one from current row and one from the next: */
                x = rows[i].getElementsByTagName('TD')[n];
                y = rows[i + 1].getElementsByTagName('TD')[n];
                /* Check if the two rows should switch place,
                based on the direction, asc or desc: */
                if (dir === 'asc') {
                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                        // If so, mark as a switch and break the loop:
                        shouldSwitch = true;
                        break;
                    }
                } else if (dir === 'desc') {
                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                        // If so, mark as a switch and break the loop:
                        shouldSwitch = true;
                        break;
                    }
                }
            }
            if (shouldSwitch) {
                /* If a switch has been marked, make the switch
                and mark that a switch has been done: */
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                // Each time a switch is done, increase this count by 1:
                switchcount ++;
            } else {
                /* If no switching has been done AND the direction is "asc",
                set the direction to "desc" and run the while loop again. */
                if (switchcount === 0 && dir === 'asc') {
                    dir = 'desc';
                    switching = true;
                }
            }
        }
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
