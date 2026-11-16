
import { Router } from 'express';

export function crearRouterNoticias(repositorio) {
    const router = Router();

    router.get('/', (req, res) => {
        try {
            const noticias = repositorio.obtenerTodas();

            noticias.sort((a, b) =>
                new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );

            const { pagina, limite } = req.query;


            if (pagina === undefined && limite === undefined) {
                return res.json(noticias.map(noticia => noticia.toJSON()));
            }

            const numeroPagina = Number(pagina ?? 1);
            const cantidad = Number(limite ?? 10);

            if (
                !Number.isInteger(numeroPagina) ||
                !Number.isInteger(cantidad) ||
                numeroPagina < 1 ||
                cantidad < 1 ||
                cantidad > 50
            ) {
                return res.status(400).json({
                    error: 'Los parámetros de paginación no son válidos'
                });
            }

            const inicio = (numeroPagina - 1) * cantidad;

            const noticiasPaginadas = noticias.slice(
                inicio,
                inicio + cantidad
            );

            return res.json({
                noticias: noticiasPaginadas.map(noticia => noticia.toJSON()),
                pagina: numeroPagina,
                limite: cantidad,
                total: noticias.length,
                totalPaginas: Math.ceil(noticias.length / cantidad)
            });

        } catch (error) {
            return res.status(500).json({
                error: 'Error al obtener las noticias'
            });
        }
    });

    return router;
}
