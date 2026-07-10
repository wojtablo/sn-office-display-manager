import { Table, StringColumn, IntegerColumn, BooleanColumn, ReferenceColumn } from '@servicenow/sdk/core'

/**
 * The only custom table in ODM (SPEC.md Data Model).
 * Slides live in the `links` field: comma-separated URLs (newlines also accepted).
 * Literal commas inside a URL must be percent-encoded (%2C).
 */
export const x_804244_odm_slideshow = Table({
    name: 'x_804244_odm_slideshow',
    label: 'Slideshow',
    schema: {
        name: StringColumn({
            label: 'Name',
            mandatory: true,
            maxLength: 100,
        }),
        description: StringColumn({
            label: 'Description',
            maxLength: 1000,
        }),
        assigned_account: ReferenceColumn({
            label: 'Service account',
            referenceTable: 'sys_user',
            hint: 'Technical account of the screen that displays this slideshow',
        }),
        links: StringColumn({
            label: 'Links (comma-separated URLs)',
            maxLength: 8000,
            hint: 'Comma-separated URLs (newlines also work). Literal commas inside a URL must be encoded as %2C. Entries must be absolute (https://...) or root-relative (/...).',
        }),
        slide_duration: IntegerColumn({
            label: 'Slide duration (s)',
            default: 30,
            hint: 'Seconds each slide is shown; applies to every slide in the deck',
        }),
        hours_start: StringColumn({
            label: 'Working hours start (HH:MM)',
            default: '07:00',
            maxLength: 5,
            hint: '24h format. Invalid or empty window = always on',
        }),
        hours_end: StringColumn({
            label: 'Working hours end (HH:MM)',
            default: '19:00',
            maxLength: 5,
            hint: '24h format. End before start = overnight window',
        }),
        active: BooleanColumn({
            label: 'Active',
            default: true,
            hint: 'Kill switch: unchecked slideshows never play',
        }),
        refresh_interval: IntegerColumn({
            label: 'Refresh interval (s)',
            default: 60,
            hint: 'How often the player polls for changes',
        }),
    },
    display: 'name',
    accessibleFrom: 'package_private',
    actions: ['create', 'read', 'update', 'delete'],
    allowClientScripts: true,
    allowNewFields: true,
    allowWebServiceAccess: true, // Table API allowed; ACLs still gate every row/field
    audit: true,
})
