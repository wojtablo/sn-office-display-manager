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
                    }
                    'acl-slideshow-fields-write': {
                        table: 'sys_security_acl'
                        id: '6f22df36688a43a7bb8148b09e99af8e'
                    }
                    'acl-slideshow-read-display-own': {
                        table: 'sys_security_acl'
                        id: '87247a72f31246c2b482df0ea24552f0'
                    }
                    'acl-slideshow-read-manager': {
                        table: 'sys_security_acl'
                        id: '34b59345e4c44061b8bfbdaebab724be'
                    }
                    'acl-slideshow-write': {
                        table: 'sys_security_acl'
                        id: '6a41e6ddd60c4b398cf23dd5de6a0e68'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: 'f1516ac7994c414fa8d27629829a964e'
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
                        table: 'sys_documentation'
                        id: '1a9d90d63006493bb011274e12ad9c85'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'assigned_account'
                            language: 'en'
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
                        id: '57875a9e0ecf4bd1905ed2509796996e'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'hours_start'
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
                        table: 'sys_documentation'
                        id: '6daccf92d4334a74afd02a2925cf59a0'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'description'
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
                        table: 'sys_security_acl_role'
                        id: '7da372367d3c40008b530899a1e1bb6e'
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
                        table: 'sys_documentation'
                        id: '86afbdb5ab5044178b16ca23aef62158'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'slide_duration'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '8d1d4e4a01ae408da3910ac547cdfe62'
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
                        table: 'sys_user_role'
                        id: '9c8efd09c2e440299e5b90a0dad45a8a'
                        key: {
                            name: 'x_804244_odm.display'
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
                        key: {
                            name: 'x_804244_odm.manager'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'b6def0298dcf4a3395eaaa73eb8db3a1'
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
                        table: 'sys_security_acl_role'
                        id: 'c3d0c706a7554885bed5e4183b4455ba'
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
                        table: 'sys_security_acl_role'
                        id: 'd4c69805f38548a4b9be6651a49daa80'
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
                        table: 'sys_security_acl_role'
                        id: 'e2979c5aa9aa428cbfaa267ace3a4abc'
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
                        table: 'sys_ux_lib_asset'
                        id: 'eb9b9e14ebbd42d390c3c1a226f8147f'
                        key: {
                            name: 'x_804244_odm/templates/player'
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
                        table: 'sys_dictionary'
                        id: 'faa260a877714e43a8f87429a73ad10e'
                        key: {
                            name: 'x_804244_odm_slideshow'
                            element: 'links'
                        }
                    },
                ]
            }
        }
    }
}
