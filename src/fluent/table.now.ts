import { Table, StringColumn, IntegerColumn, BooleanColumn, ReferenceColumn, UrlColumn } from '@servicenow/sdk/core'

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
            hint: 'The technical/service account this slideshow is displayed under. A screen logged in as this account (e.g. via Bomgar) plays this slideshow. The player link points here.',
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
        public: BooleanColumn({
            label: 'Public',
            default: false,
            hint: 'When checked, anyone can open this slideshow (bypasses the creator/service-account access check)',
        }),
        player_link: UrlColumn({
            label: 'Player link',
            maxLength: 512,
            // Read-only is enforced on the form by a UI Policy (see ui-policy.now.ts),
            // not the dictionary flag — the SDK install path does not apply
            // sys_dictionary.read_only to an existing column reliably.
            hint: 'Direct link to this slideshow on its screen — maintained automatically from the service account',
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
