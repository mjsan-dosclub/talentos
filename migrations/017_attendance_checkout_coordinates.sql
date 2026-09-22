alter table public.attendance_records
  add column if not exists check_out_lat numeric;

alter table public.attendance_records
  add column if not exists check_out_lng numeric;
