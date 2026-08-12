async function run() {
  const { validateVehicleTemplate } = await import('./src/templates/validator.ts'); // This won't work in node without ts-node
}
run();
