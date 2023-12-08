#!/bin/bash
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
WHITE='\033[0m'
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
             "REACT_APP_BACKEND_PORT")

defaultValues=("frontend"\
				"backend"\
				"postgres_db"\
				"pga"\
				"admin@42.com"\
				"pgadmin"\
				"3000:3000"\
                "3000"\
				"localhost"\
				"3001:3001"\
                "3001"\
				"localhost"\
				"postgres_db"\
				"5432:5432"\
				"admin"\
				"admin"\
				"ft_transcendence"\
				"YOUR_42API_CLIENT_ID"\
				"YOUR_42API_SECRET"\
				"http://localhost:3001/api/auth/login"\
				"dzqinijeuhgriejiakdizajf"\
				"fnuribfhrnj,ezibglspẑs"\
				"15m"\
				"7d"\
                "http://localhost"\
                "3001"
				)
echo -e "${BLUE}Type Enter for default config (test with one pc local)"
echo 'Type 1 to create full config from scratch (ignore)'
echo -e "Type 2 to create dev config(test with multiple devices${WHITE})"
read -p "Enter your choice: " input

if [[ $input == '' ]]; then
    echo "#Default" > .env
    for ((i=0; i<${#configNames[@]}; i++)); do
        echo "${configNames[i]}=${defaultValues[i]}" >> .env
    done

    value=0
    for ((i=0; i<${#configNames[@]}; i++, value++)); do
        echo "$value : ${configNames[i]}=${defaultValues[i]}"
    done

    echo "If you want to change a value, type the corresponding number; otherwise, press Enter"
    read input

    if [[ $input == '' ]]; then
        exit
    else
        echo "Type the new value"
        read new_value
        sed -i "" "s/${configNames[$input]}=.*/${configNames[$input]}=${new_value}/" ".env"
        echo "Replacement done"
    fi
elif [[ $input == '1' ]]; then
    echo "#Default" > .env
    for config in "${configNames[@]}"; do
        read -p "Enter the value for $config: " value
        echo "$config=$value" >> .env
    done
elif [[ $input == '2' ]]; then
    echo "#Dev" > .env
    for ((i=0; i<${#configNames[@]}; i++)); do
        echo "${configNames[i]}=${defaultValues[i]}" >> .env
    done
    echo "Type FrontEnd IP"
    read input
    sed -i "" "s/FRONT_URL=.*/FRONT_URL=${input}/" ".env"

    echo "Type BackEnd IP"
    read input
    sed -i "" "s/BACK_URL=.*/BACK_URL=${input}/" ".env"

    echo "Type Ip for 42Redirect <example 127.0.0.1>"
    read input
    echo "Type port for 42Redirect <example 3001>"
    read value
    sed -i "" "s|API42_REDIRECT=.*|API42_REDIRECT=http://${input}:${value}/api/auth/login/|g" ".env"

    echo "Now to declare variables for REACT...."
    echo "Type again the backend IP)"
    read input
    sed -i "" "s#REACT_APP_BACKEND_URL=.*#REACT_APP_BACKEND_URL=http://${input}#" ".env"
    echo "Type again the backend PORT)"
    read input
    sed -i "" "s/REACT_APP_BACKEND_PORT=.*/REACT_APP_BACKEND_PORT=${input}/" ".env"
    echo -e "${GREEN}Success.${NC}"
    echo -e "${YELLOW}If not working change the API42_CLIENT and API42_SECRET manully to your own api${NC}"
fi
