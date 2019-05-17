# Install ChromeDriver.
OS="`uname`"

case $OS in
  'Linux')
    OS='Linux'
    CHROME_DRIVER=http://chromedriver.storage.googleapis.com/2.46/chromedriver_linux64.zip
    ;;
  'WindowsNT')
    OS='Windows'
    CHROME_DRIVER=http://chromedriver.storage.googleapis.com/2.46/chromedriver_win32.zip
    ;;
  'Darwin')
    OS='Mac'
    CHROME_DRIVER=http://chromedriver.storage.googleapis.com/2.46/chromedriver_mac64.zip
    ;;
  *) ;;
esac

ls ./chromedriver.zip || wget -N $CHROME_DRIVER -O chromedriver.zip
mkdir ./test/e2e/lib
unzip chromedriver.zip
mv -f chromedriver ./test/e2e/lib/chromedriver
chmod 0755 ./test/e2e/lib/chromedriver
