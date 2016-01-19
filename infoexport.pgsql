--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: categoriesmain; Type: TABLE; Schema: public; Owner: anguswong; Tablespace: 
--

CREATE TABLE categoriesmain (
    catname character varying(80),
    catdesc character varying(140),
    subcat character varying(80),
    catnumb real
);


ALTER TABLE categoriesmain OWNER TO anguswong;

--
-- Name: categoriessubone; Type: TABLE; Schema: public; Owner: anguswong; Tablespace: 
--

CREATE TABLE categoriessubone (
    catnameone character varying(80),
    catnamedesc character varying(140),
    catparent character varying(80)
);


ALTER TABLE categoriessubone OWNER TO anguswong;

--
-- Name: categoriessubthree; Type: TABLE; Schema: public; Owner: anguswong; Tablespace: 
--

CREATE TABLE categoriessubthree (
    catnamethree character varying(80),
    catnamedesc character varying(140),
    catparent character varying(80)
);


ALTER TABLE categoriessubthree OWNER TO anguswong;

--
-- Name: categoriessubtwo; Type: TABLE; Schema: public; Owner: anguswong; Tablespace: 
--

CREATE TABLE categoriessubtwo (
    catnametwo character varying(80),
    catnamedesc character varying(140),
    catparent character varying(80)
);


ALTER TABLE categoriessubtwo OWNER TO anguswong;

--
-- Name: login; Type: TABLE; Schema: public; Owner: anguswong; Tablespace: 
--

CREATE TABLE login (
    username character varying(20),
    password character varying(20)
);


ALTER TABLE login OWNER TO anguswong;

--
-- Name: products; Type: TABLE; Schema: public; Owner: anguswong; Tablespace: 
--

CREATE TABLE products (
    itemname character varying(80),
    itemdesc character varying(255),
    itemcat character varying(80),
    itempicture1 character varying(80),
    itempicture2 character varying(80),
    itemnumb real,
    itemcatnumb real
);


ALTER TABLE products OWNER TO anguswong;

--
-- Data for Name: categoriesmain; Type: TABLE DATA; Schema: public; Owner: anguswong
--

COPY categoriesmain (catname, catdesc, subcat, catnumb) FROM stdin;
\N	\N	\N	100
first cat	first desc	\N	101
second cat	cat desc	\N	102
third cat	cat description	\N	103
\.


--
-- Data for Name: categoriessubone; Type: TABLE DATA; Schema: public; Owner: anguswong
--

COPY categoriessubone (catnameone, catnamedesc, catparent) FROM stdin;
\.


--
-- Data for Name: categoriessubthree; Type: TABLE DATA; Schema: public; Owner: anguswong
--

COPY categoriessubthree (catnamethree, catnamedesc, catparent) FROM stdin;
\.


--
-- Data for Name: categoriessubtwo; Type: TABLE DATA; Schema: public; Owner: anguswong
--

COPY categoriessubtwo (catnametwo, catnamedesc, catparent) FROM stdin;
\.


--
-- Data for Name: login; Type: TABLE DATA; Schema: public; Owner: anguswong
--

COPY login (username, password) FROM stdin;
anguswong	password
anotheruser	password2
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: anguswong
--

COPY products (itemname, itemdesc, itemcat, itempicture1, itempicture2, itemnumb, itemcatnumb) FROM stdin;
\N	\N	\N	\N	\N	100	\N
first cat item	first desk	first cat	itemPic-1453125469341	\N	101	101
item 2	second cat	second cat	itemPic-1453125492303	\N	102	102
item 3	third cat item	third cat	itemPic-1453125510465	\N	103	103
another cat 1 item	cat 1 item	first cat	itemPic-1453125654887	\N	104	101
\.


--
-- Name: public; Type: ACL; Schema: -; Owner: anguswong
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM anguswong;
GRANT ALL ON SCHEMA public TO anguswong;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

