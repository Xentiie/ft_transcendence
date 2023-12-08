import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import { SpelunkerModule } from 'nestjs-spelunker';


import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { config_hosts } from './config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const tree = SpelunkerModule.explore(app);
  const root = SpelunkerModule.graph(tree);
  const edges = SpelunkerModule.findGraphEdges(root);
  const mermaidEdges = edges.map(({ from, to }) => `${from.module.name}-->${to.module.name}`);
  console.log(`graph TD\n\t${mermaidEdges.join('\n\t')}`);

  const config = new DocumentBuilder()
  .setTitle('Ft_transcendence_backend')
  .setDescription('Backend for ft_transcendence')
  .setVersion('1.0')
  .addBearerAuth()
  .addServer(`http://localhost:${config_hosts.back_port}/api`)
  .build()

  
  const document = SwaggerModule.createDocument(app, config, {})
  SwaggerModule.setup('api/docs', app, document)

  app.setGlobalPrefix('api')
  app.use(cookieParser())
  app.enableCors({
    allowedHeaders: ['Content-Type'],
    origin: `http://${config_hosts.front_url}:${config_hosts.front_port}`,
    credentials: true,
  })

  await app.listen(3001)
}
bootstrap()