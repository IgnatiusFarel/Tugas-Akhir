import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { io as ClientIO, Socket as ClientSocket } from 'socket.io-client';
import { Server, Socket } from 'socket.io';
import { Subject } from 'rxjs';

@WebSocketGateway({ cors: true })
export class ScraperGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private pythonSocket: ClientSocket;
  private isPythonConnected = false;
  private scrapeCompletedSubject = new Subject<any>();
  private scrapeErrorSubject = new Subject<any>();
  private scrapeResultSubject = new Subject<any>();
  private loadingSubject = new Subject<any>();
  private pythonDisconnectedSubject = new Subject<void>();
  private activeScrapingProcesses: { [source: string]: boolean } = {};
  private lastHeartbeatTimestamps: { [source: string]: number } = {};

  onLoading(callback: (data: any) => void) {
    return this.loadingSubject.subscribe(callback);
  }

  onScrapeDone(callback: (data: any) => void) {
    return this.scrapeCompletedSubject.subscribe(callback);
  }

  onScrapeError(callback: (data: any) => void) {
    return this.scrapeErrorSubject.subscribe(callback);
  }

  onScrapeResult(callback: (data: any) => void) {
    return this.scrapeResultSubject.subscribe(callback);
  }

  onPythonServerDisconnected(callback: () => void) {
    return this.pythonDisconnectedSubject.subscribe(callback);
  }

  async isScraping(source: string): Promise<boolean> {
    return new Promise((resolve) => {
      const statusListener = (data: any) => {
        if (data.source === source) {
          this.pythonSocket.off('status_response', statusListener);
          this.activeScrapingProcesses[source] = data.active;
          this.lastHeartbeatTimestamps[source] = Date.now();
          resolve(data.active);
        }
      };
      this.pythonSocket.on('status_response', statusListener);
      this.pythonSocket.emit('check_status', { source });

      setTimeout(() => {
        this.pythonSocket.off('status_response', statusListener);
        console.log(`Timeout waiting for status check response for ${source}`);
        resolve(this.activeScrapingProcesses[source] || false);
      }, 120000);
    });
  }

  afterInit() {
    this.pythonSocket = ClientIO('http://localhost:8765', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 15000,
      timeout: 180000,
      transports: ['websocket', 'polling'],
      forceNew: true,
      autoConnect: true
    });

    this.pythonSocket.on('connect', () => {
      this.isPythonConnected = true;
      console.log('✅ Terhubung ke Python Scraper');
    });

    this.pythonSocket.on('status_response', (data) => {
      if (data.source) {
        this.lastHeartbeatTimestamps[data.source] = Date.now();
      }
    });

    this.pythonSocket.on('scrape_log', (msg) => {
      console.log('Log dari Python:', msg);
    });

    this.pythonSocket.on('loading', (msg) => {
      if (msg.source) {
        this.activeScrapingProcesses[msg.source] = true;
        this.lastHeartbeatTimestamps[msg.source] = Date.now();
      }
      this.server.emit('loading', msg);
      this.loadingSubject.next(msg);
    });

    this.pythonSocket.on('scrape_done', (data) => {
      if (data.source) {
        this.activeScrapingProcesses[data.source] = false;
        delete this.lastHeartbeatTimestamps[data.source];
      }
      this.server.emit('scrape_done', data);
      this.scrapeCompletedSubject.next(data);
    });

    this.pythonSocket.on('scrape_result', (data) => {
      console.log(`Menerima scrape_result dengan ${data.jobs?.length || 0} pekerjaan`);
      this.server.emit('scrape_result', data);
      this.scrapeResultSubject.next(data);
    });

    this.pythonSocket.on('scrape_error', (errMsg) => {
      if (errMsg.source) {
        this.activeScrapingProcesses[errMsg.source] = false;
        delete this.lastHeartbeatTimestamps[errMsg.source];
      }
      this.server.emit('scrape_error', errMsg);
      this.scrapeErrorSubject.next(errMsg);
    });

    this.pythonSocket.on('disconnect', () => {
      this.isPythonConnected = false;
      console.log('❌ Terputus dari Python Scraper');
      this.server.emit('python_server_disconnected');
      this.pythonDisconnectedSubject.next();

      Object.keys(this.activeScrapingProcesses).forEach(source => {
        if (this.activeScrapingProcesses[source]) {
          const last = this.lastHeartbeatTimestamps[source] || 0;
          const now = Date.now();
          const elapsed = now - last;

          if (elapsed < 120000) {
            console.warn(`⚠️ Terakhir heartbeat dari ${source} baru ${Math.floor(elapsed / 1000)} detik lalu. Skip failed.`);
            return;
          }

          this.activeScrapingProcesses[source] = false;
          this.server.emit('scrape_error', {
            source,
            message: 'Python server disconnected during scraping'
          });
        }
      });
    });
  }

  getPythonServerStatus(): boolean {
    return this.isPythonConnected;
  }

  handleConnection(client: Socket) {
    console.log('Frontend connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Frontend disconnected:', client.id);
  }

  @SubscribeMessage('scraping_request')
  handleScrapingRequest(@MessageBody() data: any) {
    console.log('Request dari frontend:', data);
    if (data.source) {
      this.activeScrapingProcesses[data.source] = true;
    }
    this.pythonSocket.emit('scraping_request', data);
  }

  requestScraping(data: any) {
    console.log('Requesting scraping:', data);
    if (data.source) {
      this.activeScrapingProcesses[data.source] = true;
    }
    this.pythonSocket.emit('scraping_request', data);
  }
}
