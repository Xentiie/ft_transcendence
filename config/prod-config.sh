#!/bin/bash

input=0
value=
configNames=("FRONTEND_SERVICE" \
             "BACKEND_SERVICE" \
             "POSTGRES_SERVICE" \
             "PG_SERVICE" \
             "PG_ADMIN_EMAIL" \
             "PG_PASSWORD" \
             "FRONT_PORT" \
             "LOCAL_FRONT_PORT"\
             "FRONT_URL" \
             "BACK_PORT" \
             "LOCAL_BACK_PORT" \
             "BACK_URL" \
             "DB_HOST" \
             "DB_PORT" \
             "DB_USER" \
             "DB_PSWD" \
             "DB_NAME" \
             "API42_CLIENT" \
             "API42_SECRET" \
             "API42_REDIRECT" \
             "JWT_SECRET_TOKEN" \
             "JWT_SECRET_REFRESH" \
             "JWT_EXPIRE_TOKEN" \
             "JWT_EXPIRE_REFRESH"\
             "REACT_APP_BACKEND_URL"\
             "REACT_APP_BACKEND_PORT"
             )

echo "#-----PROD_ENV-----" > .env
for config in "${configNames[@]}"; do
    read -p "Enter the value for $config: " value
    echo "$config=$value" >> .env
done
    echo "If you want to change a value, type the corresponding number; otherwise, press Enter"
read input
if [[ $input == '' ]]; then
    exit
else
    echo "Type the new value"
    read new_value
    sed -i "s/${configNames[$input]}=.*/${configNames[$input]}=${new_value}/" ".env"
    echo "Replacement done"
fi