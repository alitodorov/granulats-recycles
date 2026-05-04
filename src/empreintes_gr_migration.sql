create table if not exists empreintes_gr (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  t_input numeric,
  fuel_liters numeric,
  dist_km numeric,
  kwh numeric,
  t_output numeric,
  co2_machines numeric,
  co2_transport numeric,
  co2_total numeric,
  co2_per_tonne numeric,
  vs_ademe numeric
);
