    
process.env['SYS_ENV'] = 'dev'
process.env['UTNO_HOST'] = 'https://dev.nasjonalturbase.no'
process.env['UTNO_API_KEY'] = '0e1718433eece23d17c3f49c55018c5bd2181c99'


process.env['DB_HOST'] = '10.0.0.125'
process.env['DB_USER'] = 'postgres'
process.env['DB_PASSWORD'] = 'postgres'
process.env['DB_DATABASE'] = 'geodata'
process.env['DB_PORT'] = 5432
process.env['DB_MAX_CLIENTS'] = 50

process.env['FACEBOOK_APP_ID'] = '676410062538230'
process.env['FACEBOOK_APP_SECRET'] = '924f0d9386dad127de587b417305fb66'
process.env['CONFLICT_ACTION'] = 'update' // 'notify' // 'revert'