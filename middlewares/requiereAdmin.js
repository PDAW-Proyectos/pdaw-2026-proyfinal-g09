export default function requiereAdmin(req, res, next) {
    if (!req.usuario) {
        return res.status(401).json({
            error: 'Debés iniciar sesión'
        });
    }
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({
            error: 'No tenés permisos de administrador'
        });
    }
    next();
}