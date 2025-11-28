


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."asset_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "asset_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "price" numeric(15,2) NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "date" "date" DEFAULT CURRENT_DATE NOT NULL,
    CONSTRAINT "asset_history_price_positive" CHECK (("price" >= (0)::numeric))
);


ALTER TABLE "public"."asset_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."asset_history" IS 'Stores one daily price snapshot per asset for portfolio evolution tracking. Updated automatically during daily price updates.';



COMMENT ON COLUMN "public"."asset_history"."price" IS 'Asset price at the time of recording (current_price value)';



COMMENT ON COLUMN "public"."asset_history"."recorded_at" IS 'Exact timestamp when the price was recorded';



COMMENT ON COLUMN "public"."asset_history"."date" IS 'Date of the snapshot (used for uniqueness constraint)';



CREATE TABLE IF NOT EXISTS "public"."assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "symbol" "text",
    "quantity" numeric DEFAULT 0 NOT NULL,
    "current_price" numeric DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_updated" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."assets" OWNER TO "postgres";


COMMENT ON COLUMN "public"."assets"."symbol" IS 'Yahoo Finance symbol for automatic price updates (e.g., AAPL, MSFT, BTC-USD)';



ALTER TABLE ONLY "public"."asset_history"
    ADD CONSTRAINT "asset_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."asset_history"
    ADD CONSTRAINT "unique_asset_daily_history" UNIQUE ("asset_id", "date");



CREATE INDEX "idx_asset_history_asset_id" ON "public"."asset_history" USING "btree" ("asset_id");



CREATE INDEX "idx_asset_history_date" ON "public"."asset_history" USING "btree" ("date" DESC);



CREATE INDEX "idx_asset_history_user_asset_date" ON "public"."asset_history" USING "btree" ("user_id", "asset_id", "date" DESC);



CREATE INDEX "idx_assets_symbol" ON "public"."assets" USING "btree" ("symbol") WHERE ("symbol" IS NOT NULL);



ALTER TABLE ONLY "public"."asset_history"
    ADD CONSTRAINT "asset_history_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."asset_history"
    ADD CONSTRAINT "asset_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assets"
    ADD CONSTRAINT "assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Users can delete their own assets" ON "public"."assets" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own asset history" ON "public"."asset_history" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own assets" ON "public"."assets" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own asset history" ON "public"."asset_history" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own assets" ON "public"."assets" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own asset history" ON "public"."asset_history" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own assets" ON "public"."assets" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."asset_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assets" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."asset_history";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."assets";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";














































































































































































GRANT ALL ON TABLE "public"."asset_history" TO "anon";
GRANT ALL ON TABLE "public"."asset_history" TO "authenticated";
GRANT ALL ON TABLE "public"."asset_history" TO "service_role";



GRANT ALL ON TABLE "public"."assets" TO "anon";
GRANT ALL ON TABLE "public"."assets" TO "authenticated";
GRANT ALL ON TABLE "public"."assets" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































