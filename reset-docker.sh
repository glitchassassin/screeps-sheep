docker compose down -v
docker compose up -d
until docker compose exec screeps curl -X POST http://localhost:21026/cli -d 'system.resetAllData()'; do
  echo "Waiting for server..."
  sleep 10
done
docker compose restart screeps
until docker compose exec screeps curl -X POST http://localhost:21026/cli -d 'utils.addNPCTerminals()'; do
  echo "Waiting for server..."
  sleep 5
done
docker compose exec screeps curl -X POST http://localhost:21026/cli -d 'system.pauseSimulation()'
