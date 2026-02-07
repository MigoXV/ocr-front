docker build -t registry.cn-hangzhou.aliyuncs.com/migo-dl/ocr-front:0.1.0a1 .


docker run -it --rm \
--name ocr-front \
-p 4173:80 \
-e API_UPSTREAM=http://172.17.0.1:8000 \
registry.cn-hangzhou.aliyuncs.com/migo-dl/ocr-front:0.1.0a1