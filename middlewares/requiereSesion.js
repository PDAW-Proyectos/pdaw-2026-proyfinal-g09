export default function requiereSesion(repositorioUsuarios) {
    return (req, res, next) => {
        const usuarioId = req.session?.usuarioId;
        if (!usuarioId) {
            return res.status(401).json({
                error: 'Debés iniciar sesión para acceder a este recurso'
            });
        }
        const usuario = repositorioUsuarios.buscarPorId(usuarioId);
        if (!usuario) {
            return res.status(401).json({
                error: 'La sesión no es válida'
            });
        }
        req.usuario = usuario;
        next();
    };
}