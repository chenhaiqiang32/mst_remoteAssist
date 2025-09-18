#!/bin/sh
PROTOC_GEN_TS_PATH="./node_modules/.bin/protoc-gen-ts_proto"
OUT_DIR="./src/utils/proto"

mkdir -p $OUT_DIR

protoc \
  --plugin=$PROTOC_GEN_TS_PATH \
  --ts_proto_opt=esModuleInterop=true,forceLong=long,useOptionals=messages \
  --ts_proto_out=$OUT_DIR \
  --proto_path= \
  chatProtocol.proto
