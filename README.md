# OPAL-Cache
[![Dim Sums](https://img.shields.io/badge/made-with_Dim_Sums-4da3ff.svg?style=flat-square)](https://www.opalproject.org)
[![Travis](https://img.shields.io/travis/OPAL-Project/OPAL-Cache/master.svg?style=flat-square)](https://travis-ci.org/OPAL-Project/OPAL-Cache) 
[![David](https://img.shields.io/david/OPAL-Project/OPAL-Cache.svg?style=flat-square)](https://david-dm.org/OPAL-Project/OPAL-Cache) 
[![David](https://img.shields.io/david/dev/OPAL-Project/OPAL-Cache.svg?style=flat-square)](https://david-dm.org/OPAL-Project/OPAL-Cache?type=dev)

OPAL - Cache micro-service

---------------------------

The opal-cache service provides caching capabilities to the opal eco-system. The opal-cache stores which queries have been executed in the past, 
 and when identical queries are submitted to the system in the future, it automatically returns the answer, without triggering any computation.
To do so, the opal-cache communicates with the opal-interface every time a query is submitted to the opal system. 

We provide the [API documentation](doc-api-swagger.yml) in swagger 2.0 format. You can paste the content in the [swagger editor](http://editor.swagger.io/) to render the API documentation.

## Configuration
At its construction, the `opalCache` microservice receives a configuration object that MUST respect the following schema:
 * [Example configuration](config/opal.cache.config.js)
 
