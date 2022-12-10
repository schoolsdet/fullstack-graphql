FROM node:16-alpine3.15
WORKDIR /app
COPY ./ /app/
RUN apk add --update python2 python3 make g++ bash && rm -rf /var/cache/apk/*
RUN npm config set python python2.7
RUN CXXFLAGS="--std=c++14" yarn install
RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]