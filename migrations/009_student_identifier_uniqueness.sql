create unique index if not exists students_phone_uidx on public.students(phone) where phone is not null and phone <> '';
