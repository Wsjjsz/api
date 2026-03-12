ARG BASE_REGISTRY=docker.io
FROM ${BASE_REGISTRY}/library/nginx:latest

WORKDIR /usr/share/nginx/html
USER root

COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
