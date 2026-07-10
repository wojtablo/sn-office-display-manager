import { Form, default_view } from '@servicenow/sdk/core'

/**
 * Default form for Slideshow: identity + assignment on top (with the direct
 * player link), content and timing below.
 *
 * NOTE: use the imported `default_view` symbol, NOT the string 'default_view' —
 * the string creates a separate view literally named "default_view" that records
 * never open in; the symbol targets the real (empty-name) Default view.
 */
export const slideshowForm = Form({
    table: 'x_804244_odm_slideshow',
    view: default_view,
    sections: [
        {
            caption: 'Slideshow',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { type: 'table_field', field: 'name' },
                        { type: 'table_field', field: 'assigned_account' },
                        { type: 'table_field', field: 'active' },
                    ],
                    rightElements: [
                        { type: 'table_field', field: 'player_link' },
                        { type: 'table_field', field: 'slide_duration' },
                        { type: 'table_field', field: 'refresh_interval' },
                    ],
                },
                {
                    layout: 'one-column',
                    elements: [
                        { type: 'table_field', field: 'links' },
                        { type: 'table_field', field: 'description' },
                    ],
                },
            ],
        },
        {
            caption: 'Working hours',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [{ type: 'table_field', field: 'hours_start' }],
                    rightElements: [{ type: 'table_field', field: 'hours_end' }],
                },
            ],
        },
    ],
})
