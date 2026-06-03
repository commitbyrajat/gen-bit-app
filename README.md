### IBIS Server
- Path: core/ibis-server
- just install
- just install-core
- export WREN_ENGINE_ENDPOINT=http://localhost:8080
- just run

## Wren Engine Legacy
- Path: core/wren-core-legacy
- Update docker/etc/config.properties
- ./mvnw clean install -DskipTests -P exec-jar
- java -Dconfig=docker/etc/config.properties --add-opens=java.base/java.nio=ALL-UNNAMED -jar wren-server/target/wren-server-0.15.2-SNAPSHOT-**executable**.jar


## AI Service
- Path: app/wren-ai-service
- just init
- Export OPENAI_API_KEY
- just start

## UI
- Path: app/wren-ui
- Update src/apollo/server/config.ts
  - Update wrenAIEndpoint: 'http://localhost:5555' to wrenAIEndpoint: 'http://localhost:5556'
- Update src/utils/validator/hostValidator.ts
  - remove "127.0.0.1" from the list
- env DB_TYPE=pg PG_URL=postgres://wren:wren123@localhost:5433/wren_ui_metadata  yarn migrate
- env DB_TYPE=pg PG_URL=postgres://wren:wren123@localhost:5433/wren_ui_metadata OTHER_SERVICE_USING_DOCKER=true EXPERIMENTAL_ENGINE_RUST_VERSION=false PORT=3000 HOSTNAME=0.0.0.0 yarn build
- env DB_TYPE=pg PG_URL=postgres://wren:wren123@localhost:5433/wren_ui_metadata OTHER_SERVICE_USING_DOCKER=true EXPERIMENTAL_ENGINE_RUST_VERSION=false PORT=3000 HOSTNAME=0.0.0.0 yarn start
