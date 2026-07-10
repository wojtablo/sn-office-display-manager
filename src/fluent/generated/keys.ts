import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: 'f1516ac7994c414fa8d27629829a964e'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'b9263e9c87c2484ebb54da98a3c728a4'
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
                        table: 'sys_user_role'
                        id: '9c8efd09c2e440299e5b90a0dad45a8a'
                        key: {
                            name: 'x_804244_odm.display'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: 'b50856cd73e0409fb4dfa69369a8fe98'
                        key: {
                            name: 'x_804244_odm.manager'
                        }
                    },
                ]
            }
        }
    }
}
