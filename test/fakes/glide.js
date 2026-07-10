/**
 * Fake @servicenow/glide for jest — an in-memory table store, not a mock.
 * GlideRecordSecure additionally honors a per-row `__readable: false` marker
 * so tests can simulate ACL-filtered rows.
 */
'use strict'

let tables = {}
let user = { id: 'test-user-sys-id', name: 'test.user' }
let failNextQuery = false

function __setTable(name, rows) {
    tables[name] = rows
}
function __setUser(id, name) {
    user = { id, name }
}
function __failNextQuery() {
    failNextQuery = true
}
function __reset() {
    tables = {}
    user = { id: 'test-user-sys-id', name: 'test.user' }
    failNextQuery = false
}

const gs = {
    getUserID: () => user.id,
    getUserName: () => user.name,
    addErrorMessage: () => undefined,
    info: () => undefined,
}

class GlideRecord {
    constructor(table) {
        this._table = table
        this._queries = []
        this._limit = Infinity
        this._rows = []
        this._i = -1
    }
    addQuery(field, value) {
        this._queries.push([field, value])
    }
    setLimit(n) {
        this._limit = n
    }
    _visible(row) {
        return true
    }
    query() {
        if (failNextQuery) {
            failNextQuery = false
            throw new Error('fake glide: query failure injected')
        }
        const all = tables[this._table] || []
        this._rows = all
            .filter((r) => this._visible(r))
            .filter((r) => this._queries.every(([f, v]) => String(r[f]) === String(v)))
            .slice(0, this._limit)
        this._i = -1
    }
    next() {
        this._i++
        return this._i < this._rows.length
    }
    getValue(field) {
        const v = this._rows[this._i][field]
        return v === undefined || v === null ? null : String(v)
    }
    getUniqueValue() {
        return String(this._rows[this._i].sys_id)
    }
}

class GlideRecordSecure extends GlideRecord {
    _visible(row) {
        return row.__readable !== false
    }
}

module.exports = { gs, GlideRecord, GlideRecordSecure, __setTable, __setUser, __reset, __failNextQuery }
