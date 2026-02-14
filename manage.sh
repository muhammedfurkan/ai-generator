#!/bin/bash

###############################################################################
# NanoInf - Yönetim Scripti
# Uygulama yönetimi için kısayol komutlar
###############################################################################

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Proje dizini
PROJECT_DIR="/opt/nanoinf"

# Komut kontrolü
if [ -z "$1" ]; then
    echo -e "${BLUE}NanoInf Yönetim Scripti${NC}\n"
    echo "Kullanım: bash manage.sh [komut]"
    echo ""
    echo "Komutlar:"
    echo "  start       - Uygulamayı başlat"
    echo "  stop        - Uygulamayı durdur"
    echo "  restart     - Uygulamayı yeniden başlat"
    echo "  status      - Durum kontrolü"
    echo "  logs        - Logları görüntüle"
    echo "  logs-app    - Sadece uygulama logları"
    echo "  logs-db     - Sadece veritabanı logları"
    echo "  logs-nginx  - Sadece nginx logları"
    echo "  update      - Uygulamayı güncelle"
    echo "  backup      - Veritabanı yedeği al"
    echo "  restore     - Veritabanı yedeğini geri yükle"
    echo "  db-push     - Database migration'larını çalıştır"
    echo "  shell       - Uygulama container'ına bağlan"
    echo "  db-shell    - MySQL shell'e bağlan"
    echo "  clean       - Eski container ve image'ları temizle"
    echo "  stats       - Kaynak kullanımı"
    echo ""
    exit 0
fi

COMMAND=$1

case $COMMAND in
    start)
        echo -e "${BLUE}Uygulama başlatılıyor...${NC}"
        cd $PROJECT_DIR
        docker-compose up -d
        echo -e "${GREEN}✓ Uygulama başlatıldı${NC}"
        ;;
    
    stop)
        echo -e "${BLUE}Uygulama durduruluyor...${NC}"
        cd $PROJECT_DIR
        docker-compose down
        echo -e "${GREEN}✓ Uygulama durduruldu${NC}"
        ;;
    
    restart)
        echo -e "${BLUE}Uygulama yeniden başlatılıyor...${NC}"
        cd $PROJECT_DIR
        docker-compose restart
        echo -e "${GREEN}✓ Uygulama yeniden başlatıldı${NC}"
        ;;
    
    status)
        echo -e "${BLUE}Durum Kontrolü:${NC}\n"
        cd $PROJECT_DIR
        docker-compose ps
        ;;
    
    logs)
        echo -e "${BLUE}Tüm Loglar (Ctrl+C ile çıkış):${NC}\n"
        cd $PROJECT_DIR
        docker-compose logs -f --tail=100
        ;;
    
    logs-app)
        echo -e "${BLUE}Uygulama Logları (Ctrl+C ile çıkış):${NC}\n"
        cd $PROJECT_DIR
        docker-compose logs -f --tail=100 app
        ;;
    
    logs-db)
        echo -e "${BLUE}Veritabanı Logları (Ctrl+C ile çıkış):${NC}\n"
        cd $PROJECT_DIR
        docker-compose logs -f --tail=100 mysql
        ;;
    
    logs-nginx)
        echo -e "${BLUE}Nginx Logları (Ctrl+C ile çıkış):${NC}\n"
        cd $PROJECT_DIR
        docker-compose logs -f --tail=100 nginx
        ;;
    
    update)
        echo -e "${BLUE}Uygulama güncelleniyor...${NC}"
        cd $PROJECT_DIR
        
        # Git pull (eğer git kullanılıyorsa)
        if [ -d ".git" ]; then
            echo "Git repository güncelleniyor..."
            git pull
        fi
        
        # Yeniden build ve başlat
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        
        # Migration'ları çalıştır
        sleep 10
        docker-compose exec -T app pnpm db:push
        
        echo -e "${GREEN}✓ Uygulama güncellendi${NC}"
        ;;
    
    backup)
        echo -e "${BLUE}Veritabanı yedeği alınıyor...${NC}"
        cd $PROJECT_DIR
        
        BACKUP_DIR="backups"
        mkdir -p $BACKUP_DIR
        
        BACKUP_FILE="$BACKUP_DIR/nanoinf_backup_$(date +%Y%m%d_%H%M%S).sql"
        
        docker-compose exec -T mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} nanoinf > $BACKUP_FILE
        
        # Sıkıştır
        gzip $BACKUP_FILE
        
        echo -e "${GREEN}✓ Yedek alındı: ${BACKUP_FILE}.gz${NC}"
        
        # Eski yedekleri temizle (30 günden eski)
        find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
        ;;
    
    restore)
        if [ -z "$2" ]; then
            echo -e "${RED}Hata: Yedek dosyası belirtilmedi!${NC}"
            echo "Kullanım: bash manage.sh restore <backup_file.sql.gz>"
            exit 1
        fi
        
        BACKUP_FILE=$2
        
        if [ ! -f "$BACKUP_FILE" ]; then
            echo -e "${RED}Hata: Yedek dosyası bulunamadı: $BACKUP_FILE${NC}"
            exit 1
        fi
        
        echo -e "${YELLOW}UYARI: Mevcut veritabanı silinecek!${NC}"
        read -p "Devam etmek istiyor musunuz? (y/N): " -n 1 -r
        echo
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "İptal edildi."
            exit 0
        fi
        
        echo -e "${BLUE}Veritabanı geri yükleniyor...${NC}"
        cd $PROJECT_DIR
        
        # Sıkıştırmayı aç ve geri yükle
        gunzip -c $BACKUP_FILE | docker-compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} nanoinf
        
        echo -e "${GREEN}✓ Veritabanı geri yüklendi${NC}"
        ;;
    
    db-push)
        echo -e "${BLUE}Database migration'ları çalıştırılıyor...${NC}"
        cd $PROJECT_DIR
        docker-compose exec app pnpm db:push
        echo -e "${GREEN}✓ Migration'lar tamamlandı${NC}"
        ;;
    
    shell)
        echo -e "${BLUE}Uygulama container'ına bağlanılıyor...${NC}"
        cd $PROJECT_DIR
        docker-compose exec app sh
        ;;
    
    db-shell)
        echo -e "${BLUE}MySQL shell'e bağlanılıyor...${NC}"
        cd $PROJECT_DIR
        docker-compose exec mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} nanoinf
        ;;
    
    clean)
        echo -e "${BLUE}Temizlik yapılıyor...${NC}"
        
        # Durmuş container'ları temizle
        docker container prune -f
        
        # Kullanılmayan image'ları temizle
        docker image prune -a -f
        
        # Kullanılmayan volume'ları temizle
        docker volume prune -f
        
        # Kullanılmayan network'leri temizle
        docker network prune -f
        
        echo -e "${GREEN}✓ Temizlik tamamlandı${NC}"
        ;;
    
    stats)
        echo -e "${BLUE}Kaynak Kullanımı:${NC}\n"
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
        ;;
    
    *)
        echo -e "${RED}Hata: Bilinmeyen komut: $COMMAND${NC}"
        echo "Yardım için: bash manage.sh"
        exit 1
        ;;
esac
