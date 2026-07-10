import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    'acl-slideshow-create': {
                        table: 'sys_security_acl'
                        id: '8e41b8f26f414dfb911ad632eca786a6'
                    }
                    'acl-slideshow-delete': {
                        table: 'sys_security_acl'
                        id: 'f8c9d258af03417a971570e15372275e'
                    }
                    'acl-slideshow-fields-read': {
                        table: 'sys_security_acl'
                        id: '3594382cb71f485eb24be74446ab9ea9'
                        deleted: true
                    }
                    'acl-slideshow-fields-write': {
                        table: 'sys_security_acl'
                        id: '6f22df36688a43a7bb8148b09e99af8e'
                        deleted: true
                    }
                    'acl-slideshow-read': {
                        table: 'sys_security_acl'
                        id: 'fe537a2155e24772b088af2cedc69dfc'
                    }
                    'acl-slideshow-read-display-own': {
                        table: 'sys_security_acl'
                        id: '87247a72f31246c2b482df0ea24552f0'
                        deleted: true
                    }
                    'acl-slideshow-read-manager': {
                        table: 'sys_security_acl'
                        id: '34b59345e4c44061b8bfbdaebab724be'
                        deleted: true
                    }
                    'acl-slideshow-write': {
                        table: 'sys_security_acl'
                        id: '6a41e6ddd60c4b398cf23dd5de6a0e68'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: 'f1516ac7994c414fa8d27629829a964e'
                    }
                    'br-maintain-player-link': {
                        table: 'sys_script'
                        id: 'cda26037f33a48eb807095aa4e458f20'
                    }
                    'br-unique-active-assignment': {
                        table: 'sys_script'
                        id: 'a93f1fb2e8a24841ae812d1feff1252d'
                    }
                    'module-all-slides': {
                        table: 'sys_app_module'
                        id: '9dbb7eee164548188d6bbf0615a5173a'
                    }
                    'module-my-slideshows': {
                        table: 'sys_app_module'
                        id: 'd9e8f80d1426408189780ccfa73b0430'
                    }
                    'odm-app-menu': {
                        table: 'sys_app_application'
                        id: '29ec71b6e343434f80272c14b381fa4c'
                    }
                    'odm-player-api': {
                        table: 'sys_ws_definition'
                        id: '479394f804ca46b9a4f735aeb62e5c58'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'b9263e9c87c2484ebb54da98a3c728a4'
                    }
                    'param-deck-screen': {
                        table: 'sys_ws_query_parameter'
                        id: 'd144e7b829ec47dbb35ab6079ba40fbf'
                    }
                    'route-deck-base': {
                        table: 'sys_ws_operation'
                        id: '3ea995c6c89143d08761f751d6a28bcb'
                    }
                    'route-deck-screen': {
                        table: 'sys_ws_operation'
                        id: '31645d1c6695463db538f11e03b857c6'
                    }
                    'route-player-base': {
                        table: 'sys_ws_operation'
                        id: 'b2ad7e2b91d142fab8a3f98e1e142522'
                    }
                    'route-player-screen': {
                        table: 'sys_ws_operation'
                        id: 'd12d08df16984211bd35dcd51daec9ec'
                    }
                    'si-odm-player-page': {
                        table: 'sys_script_include'
                        id: 'ef76b1eb4ae54dcb99172e525f684e73'
                    }
                    src_server_deck_ts: {
                        table: 'sys_module'
                        id: '89021756f4574f0f9d6792a90cc1ec4d'
                    }
                    src_server_handlers_src_ts: {
                        table: 'sys_module'
                        id: '9b20b5c28a764d92a49ab869ffa8e917'
                    }
                    src_server_OdmTemplates_ts: {
                        table: 'sys_module'
                        id: 'af5139a4615b47f48f5decff6fb56fcd'
                    }
                    'src_server_player-routes_ts': {
                        table: 'sys_module'
                        id: 'a2c47d6e51bf43b68e9f49a542fdfb66'
                    }
                }
                composite: [
                    {
                        table: 'sys_user_role'
                        id: '01da09f8c34e07106292b34ed40131e9'
                        deleted: true
                        key: {
                            name: 'x_804244_odm.admin'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0ae968edbe1b4b21bf725f520497471b'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_ui_section'
                        id: '0d69c4c9fe2a4d758ea4efc5d60f68a9'
                        deleted: true
                        key: {
                            name: 'x_804244_odm_slideshow'
                            caption: 'Slideshow'
                            view: {
                                id: '22312a17d996423bacbb14fab712ce48'
                                key: {
                                    name: 'default_view'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0f9c970881d2412bb77a4e9401110bcc'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'assigned_account'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '14e494365c1f47598977c2a4f3339eb7'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'hours_end'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '1642fe0cabb34eefa05adbb26fe9ed17'
                        deleted: true
                        key: {
                            sys_security_acl: '3594382cb71f485eb24be74446ab9ea9'
                            sys_user_role: {
                                id: '9c8efd09c2e440299e5b90a0dad45a8a'
                                key: {
                                    name: 'x_804244_odm.display'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '1690215dfc134e47ad9ea781ab06c083'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '0d69c4c9fe2a4d758ea4efc5d60f68a9'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'active'
                            position: '3'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1a9d90d63006493bb011274e12ad9c85'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'assigned_account'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '1dec8da5ed1649d1bcd287c4fe04951e'
                        deleted: true
                        key: {
                            sys_security_acl: '8e41b8f26f414dfb911ad632eca786a6'
                            sys_user_role: {
                                id: '901b25e81c4c4d0199c44d7f37c41a51'
                                key: {
                                    name: 'snc_internal'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '1df78d48cc254a06b992aebf408feb4d'
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.begin_split'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '2191f88d53c143ad9b2fd30a4ede609c'
                        key: {
                            sys_ui_section: {
                                id: '689a38a15ce2409f9afba0f2e64d09aa'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Working hours'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'hours_end'
                            position: '3'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '22b193518beb48c391703ea5edef0daf'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '0d69c4c9fe2a4d758ea4efc5d60f68a9'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.end_split'
                            position: '8'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '2d3f16dde0b342e099bee5f313499892'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.end_split'
                            position: '8'
                        }
                    },
                    {
                        table: 'sys_ui_section'
                        id: '2eb2deb1904240f1a681119933721dad'
                        deleted: true
                        key: {
                            name: 'x_804244_odm_slideshow'
                            caption: 'Working hours'
                            view: {
                                id: '22312a17d996423bacbb14fab712ce48'
                                key: {
                                    name: 'default_view'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '3799ac9925f146ea9bcc08abd073b586'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '2eb2deb1904240f1a681119933721dad'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Working hours'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'hours_end'
                            position: '3'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '3d2211eb82454056a8959f8f50ce6101'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '2eb2deb1904240f1a681119933721dad'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Working hours'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.begin_split'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '3ee401b20b5f446a83d3067eec4fa16f'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '0d69c4c9fe2a4d758ea4efc5d60f68a9'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'links'
                            position: '9'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '40032a3be655432dbfbaa6b42d232bab'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '450b8a5f3f814532af3d62b3dfbb8387'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'refresh_interval'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: '45db4f89441c4ff4893f908e9687e221'
                        key: {
                            sys_ui_form: {
                                id: '9cc19d9027f4443e919abc9450822e69'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '46c1371a1e074d379b3b9cac5c96b151'
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'active'
                            position: '3'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: '4724f853eaa347318ad6faab8a38755f'
                        key: {
                            sys_ui_form: {
                                id: '9cc19d9027f4443e919abc9450822e69'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: '689a38a15ce2409f9afba0f2e64d09aa'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Working hours'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '4a7ad9cbfa424f2bbdd6042be29983ba'
                        deleted: true
                        key: {
                            sys_security_acl: 'f8c9d258af03417a971570e15372275e'
                            sys_user_role: {
                                id: 'c5989c7c20844e37884c221fa171214a'
                                key: {
                                    name: 'snc_internal'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '4e250e984aab4f5fae3cda83c93045fa'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'slide_duration'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4fe1c8961d364a37ace11ee6bbdfb47d'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'links'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '536c251a596e4798ac2fec5a3e8d82de'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'player_link'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: '553bc763fe2741a29b0aa677d2bc7e0a'
                        deleted: true
                        key: {
                            sys_ui_form: {
                                id: '75c135853b5d44be8c6ae6b5c5962fe5'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: '0d69c4c9fe2a4d758ea4efc5d60f68a9'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '57875a9e0ecf4bd1905ed2509796996e'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'hours_start'
                        }
                    },
                    {
                        table: 'sys_ui_policy_action'
                        id: '5d3cdf95323b44578c943380518bc029'
                        key: {
                            ui_policy: {
                                id: 'b699ed92d8e74346b8250a53e9a45831'
                                key: {
                                    table: 'x_804244_odm_slideshow'
                                    short_description: 'Player link is read-only (system-maintained)'
                                }
                            }
                            field: 'player_link'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '619c9698ee924a6da06cef04c547f36d'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '64061f4b94d249298185241007a73eb5'
                        deleted: true
                        key: {
                            sys_security_acl: '6f22df36688a43a7bb8148b09e99af8e'
                            sys_user_role: {
                                id: 'b50856cd73e0409fb4dfa69369a8fe98'
                                key: {
                                    name: 'x_804244_odm.manager'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '646eaabff2174f6184f68f107cc94668'
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.end_split'
                            position: '9'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '65825aafb42c4e69b48db7ac122aaad1'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'public'
                        }
                    },
                    {
                        table: 'sys_ui_section'
                        id: '689a38a15ce2409f9afba0f2e64d09aa'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            caption: 'Working hours'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6daccf92d4334a74afd02a2925cf59a0'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'description'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6e8149579ac64d6dac2d4ecc618dc9fe'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'public'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '70c4c10c45a74547abc38f383b167694'
                        key: {
                            name: 'x_804244_odm/templates/player.js.map'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '729020554ac043eda678074efd5579d3'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'slide_duration'
                            position: '6'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '729b98d9aaa04437966cd4c58b094aaf'
                        key: {
                            sys_ui_section: {
                                id: '689a38a15ce2409f9afba0f2e64d09aa'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Working hours'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'hours_start'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_ui_form'
                        id: '75c135853b5d44be8c6ae6b5c5962fe5'
                        deleted: true
                        key: {
                            name: 'x_804244_odm_slideshow'
                            view: {
                                id: '22312a17d996423bacbb14fab712ce48'
                                key: {
                                    name: 'default_view'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '78a02a8da7424c27809173a195a7e143'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'hours_end'
                        }
                    },
                    {
                        table: 'sys_user_role_contains'
                        id: '79acbaac1f394460a35a604017c96dad'
                        deleted: true
                        key: {
                            role: {
                                id: '01da09f8c34e07106292b34ed40131e9'
                                key: {
                                    name: 'x_804244_odm.admin'
                                }
                            }
                            contains: {
                                id: 'b50856cd73e0409fb4dfa69369a8fe98'
                                key: {
                                    name: 'x_804244_odm.manager'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '7bfeb22b617649ef87d884ad9faaca32'
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'player_link'
                            position: '6'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '7da372367d3c40008b530899a1e1bb6e'
                        deleted: true
                        key: {
                            sys_security_acl: '87247a72f31246c2b482df0ea24552f0'
                            sys_user_role: {
                                id: '9c8efd09c2e440299e5b90a0dad45a8a'
                                key: {
                                    name: 'x_804244_odm.display'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '8013680a60064c0fa24396f049b4d9d5'
                        key: {
                            sys_ui_section: {
                                id: '689a38a15ce2409f9afba0f2e64d09aa'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Working hours'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.end_split'
                            position: '4'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '837f6f5867eb48e69d5cdb7c0a3bc05e'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '0d69c4c9fe2a4d758ea4efc5d60f68a9'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'assigned_account'
                            position: '2'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '84c9e4f6808c49e2a6341131e22379a2'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '2eb2deb1904240f1a681119933721dad'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Working hours'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.end_split'
                            position: '4'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '86afbdb5ab5044178b16ca23aef62158'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'slide_duration'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '8c2e148699594c58bf287a2267bf93ab'
                        key: {
                            sys_ui_section: {
                                id: '689a38a15ce2409f9afba0f2e64d09aa'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Working hours'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.split'
                            position: '2'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '8d1d4e4a01ae408da3910ac547cdfe62'
                        deleted: true
                        key: {
                            sys_security_acl: '6a41e6ddd60c4b398cf23dd5de6a0e68'
                            sys_user_role: {
                                id: 'b50856cd73e0409fb4dfa69369a8fe98'
                                key: {
                                    name: 'x_804244_odm.manager'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8e1aa3e4c6d84706b180e9321f5099f4'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'description'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9b237f0b92c64a4f8c438c073a56c832'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'name'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '9c54d7f5d1f94ef4925911762aa9aa1f'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'description'
                            position: '10'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: '9c8efd09c2e440299e5b90a0dad45a8a'
                        deleted: true
                        key: {
                            name: 'x_804244_odm.display'
                        }
                    },
                    {
                        table: 'sys_ui_form'
                        id: '9cc19d9027f4443e919abc9450822e69'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '9eab9ac4ba624fb88d993163e093f8d9'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '0d69c4c9fe2a4d758ea4efc5d60f68a9'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'player_link'
                            position: '5'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9ee73ce4a6404117bf866f04939c8da8'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'refresh_interval'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '9fae9950472b45d181df39e12ad3856b'
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'description'
                            position: '11'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '9feb7ce35e824414a36ca03234b45af0'
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'assigned_account'
                            position: '2'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a0ff3462fbfa416ebfe2ef83ca301c88'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'player_link'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'a87d664d4b694dca8a1b9fe6fab6a398'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'player_link'
                            position: '5'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'a996a33098494320a5443107c6dfb665'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '0d69c4c9fe2a4d758ea4efc5d60f68a9'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'description'
                            position: '10'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'a99b7fbde286467d9e5bc8090a42829d'
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.split'
                            position: '5'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: 'aed8bde9ff2d4b8d8021d4728d72731f'
                        key: {
                            endpoint: 'x_804244_odm_player.do'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'aff0b32e658341e896d384b47b988905'
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'public'
                            position: '4'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'b051a0c1ed524f61bb85dc016e20226d'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.split'
                            position: '4'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b10d34d693f24684853905ae233b428c'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: 'b50856cd73e0409fb4dfa69369a8fe98'
                        deleted: true
                        key: {
                            name: 'x_804244_odm.manager'
                        }
                    },
                    {
                        table: 'sys_ui_policy'
                        id: 'b699ed92d8e74346b8250a53e9a45831'
                        key: {
                            table: 'x_804244_odm_slideshow'
                            short_description: 'Player link is read-only (system-maintained)'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'b6def0298dcf4a3395eaaa73eb8db3a1'
                        deleted: true
                        key: {
                            sys_security_acl: 'f8c9d258af03417a971570e15372275e'
                            sys_user_role: {
                                id: 'b50856cd73e0409fb4dfa69369a8fe98'
                                key: {
                                    name: 'x_804244_odm.manager'
                                }
                            }
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'b93feaa4a9cf4b519421c72d8c7d570b'
                        key: {
                            name: 'x_804244_odm_slideshow'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'bf18797b03124c37921f66fdf5efe7e6'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '2eb2deb1904240f1a681119933721dad'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Working hours'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.split'
                            position: '2'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'c3d0c706a7554885bed5e4183b4455ba'
                        deleted: true
                        key: {
                            sys_security_acl: '34b59345e4c44061b8bfbdaebab724be'
                            sys_user_role: {
                                id: 'b50856cd73e0409fb4dfa69369a8fe98'
                                key: {
                                    name: 'x_804244_odm.manager'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_section'
                        id: 'c51c9b7a1e04492a996146947fe6ceee'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            caption: 'Slideshow'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c7667277571348e9b1569b86b9357959'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c954c72c3ae748118a40428711f15793'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'hours_start'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'c9f17af9ec4546f98ac85bb522a0052a'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '0d69c4c9fe2a4d758ea4efc5d60f68a9'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'name'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'cb29a55b6fcb450aba97a53c71ba1ced'
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'slide_duration'
                            position: '7'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'ce2ff9e63d5743d4a3b2884396b38592'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '2eb2deb1904240f1a681119933721dad'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Working hours'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'hours_start'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'd4c69805f38548a4b9be6651a49daa80'
                        deleted: true
                        key: {
                            sys_security_acl: '8e41b8f26f414dfb911ad632eca786a6'
                            sys_user_role: {
                                id: 'b50856cd73e0409fb4dfa69369a8fe98'
                                key: {
                                    name: 'x_804244_odm.manager'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'd5aa71c8054b4455b57554163bbd924d'
                        key: {
                            name: 'x_804244_odm_slideshow'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'dbce015fac81476c90f4bdc5cd32895d'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '0d69c4c9fe2a4d758ea4efc5d60f68a9'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.begin_split'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: 'de678792d3a44996ab08f725612cf221'
                        deleted: true
                        key: {
                            sys_ui_form: {
                                id: '75c135853b5d44be8c6ae6b5c5962fe5'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: '2eb2deb1904240f1a681119933721dad'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Working hours'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'e2979c5aa9aa428cbfaa267ace3a4abc'
                        deleted: true
                        key: {
                            sys_security_acl: '3594382cb71f485eb24be74446ab9ea9'
                            sys_user_role: {
                                id: 'b50856cd73e0409fb4dfa69369a8fe98'
                                key: {
                                    name: 'x_804244_odm.manager'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'e377cc7310b7454ca6006fd58a8e48a1'
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'links'
                            position: '10'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'e41c05e2033c4078802695b30cd3f34e'
                        key: {
                            sys_ui_section: {
                                id: '689a38a15ce2409f9afba0f2e64d09aa'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Working hours'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.begin_split'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'e52637ab61364b14b7c228fb489f7408'
                        deleted: true
                        key: {
                            sys_security_acl: '6a41e6ddd60c4b398cf23dd5de6a0e68'
                            sys_user_role: {
                                id: '6e0077c8feba47c2a01afd49c56062b0'
                                key: {
                                    name: 'snc_internal'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'e5ce33522c084beea92af8887934de15'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'links'
                            position: '9'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'ea8ef30967f84acb85c9f929ccd1e6c4'
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'name'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'eb3e1c8b479c4b9bb4588bbd72bba9b9'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '0d69c4c9fe2a4d758ea4efc5d60f68a9'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.split'
                            position: '4'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: 'eb9b9e14ebbd42d390c3c1a226f8147f'
                        key: {
                            name: 'x_804244_odm/templates/player'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'f25ea7a023a24569a612e16fd3f36e92'
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'refresh_interval'
                            position: '8'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'f3f1b83c4c844c64852a1d79a66453af'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '0d69c4c9fe2a4d758ea4efc5d60f68a9'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'slide_duration'
                            position: '6'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'f604c5e83bae4d0f95d633b095d2c471'
                        deleted: true
                        key: {
                            sys_security_acl: 'fe537a2155e24772b088af2cedc69dfc'
                            sys_user_role: {
                                id: 'f12ad776c4564720a429350ab09d2cab'
                                key: {
                                    name: 'snc_internal'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ws_query_parameter_map'
                        id: 'f70e1d609fc64ae5bccf11e08bc56951'
                        key: {
                            web_service_operation: '3ea995c6c89143d08761f751d6a28bcb'
                            web_service_query_parameter: 'd144e7b829ec47dbb35ab6079ba40fbf'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'f71ab67834a949d9b4e57ccd1e7cd10c'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: 'c51c9b7a1e04492a996146947fe6ceee'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'refresh_interval'
                            position: '7'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'faa260a877714e43a8f87429a73ad10e'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'links'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'fef4c56c296743d896c55b5bfd1d3e9b'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '0d69c4c9fe2a4d758ea4efc5d60f68a9'
                                key: {
                                    name: 'x_804244_odm_slideshow'
                                    caption: 'Slideshow'
                                    view: {
                                        id: '22312a17d996423bacbb14fab712ce48'
                                        key: {
                                            name: 'default_view'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'refresh_interval'
                            position: '7'
                        }
                    },
                ]
            }
        }
    }
}
