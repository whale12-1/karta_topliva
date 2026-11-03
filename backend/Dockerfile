# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .

# Увеличиваем таймауты и используем зеркало
ENV PIP_DEFAULT_TIMEOUT=300 \
    PIP_RETRIES=10

RUN pip install --no-cache-dir -r requirements.txt \
    --index-url https://mirrors.aliyun.com/pypi/simple/ \
    --trusted-host mirrors.aliyun.com

COPY ./app ./app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]