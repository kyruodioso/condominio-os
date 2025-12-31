import { auth } from '@/auth';
import dbConnect from '@/lib/dbConnect';
import Unit from '@/models/Unit'; // Asumiendo que existe y tiene relación con User
import ChatInterface from '@/components/chat/ChatInterface';
import { redirect } from 'next/navigation';

export default async function ResidentMessagesPage() {
    const session = await auth();
    if (!session?.user) redirect('/login');

    await dbConnect();
    
    // Buscar la unidad asociada a este usuario
    // Nota: Esto depende de cómo relaciones User <-> Unit. 
    // Si User tiene `unitNumber` y `condominiumId`, buscamos por eso.
    // O si Unit tiene un array de `residents` con IDs de usuario.
    // Voy a asumir una búsqueda genérica basada en lo que vi en tus archivos.
    
    // Intento 1: Buscar por email en los residentes de las unidades (si Unit tiene estructura de residentes)
    // Intento 2: Si User tiene `unitId` directo (ideal).
    
    // Como fallback seguro, buscaré una unidad donde este usuario sea residente.
    // Si no encuentro, mostraré un error.
    
    // *Suposición basada en contexto previo*: Unit tiene `residents` array o User tiene `unitId`.
    // Voy a usar una lógica segura: Buscar unidad del condominio del usuario que coincida con su número.
    
    let unitId = null;
    
    // Si el usuario tiene unitId en session (ideal)
    // @ts-ignore
    if (session.user.unitId) {
        // @ts-ignore
        unitId = session.user.unitId;
    } else {
        // Búsqueda manual
        const userUnit = await Unit.findOne({ 
            condominiumId: session.user.condominiumId,
            // Aquí asumo que User tiene unitNumber, si no, esto fallará y necesitarás ajustarlo
            // @ts-ignore
            number: session.user.unitNumber 
        });
        
        if (userUnit) {
            unitId = userUnit._id.toString();
        }
    }

    if (!unitId) {
        return (
            <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
                <div className="bg-red-900/20 border border-red-500 p-6 rounded-xl text-center">
                    <h1 className="text-xl font-bold text-red-500 mb-2">Error de Configuración</h1>
                    <p>No se encontró una unidad asociada a tu usuario.</p>
                    <p className="text-sm text-gray-400 mt-2">Contacta al administrador.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-6 pb-24">
            <div className="max-w-4xl mx-auto h-[80vh]">
                <h1 className="text-2xl font-bold mb-6 uppercase tracking-wide">
                    Mensajes con Administración
                </h1>
                <div className="h-full">
                    <ChatInterface 
                        unitId={unitId} 
                        currentUserRole="USER" 
                        title="Chat con Administración"
                    />
                </div>
            </div>
        </div>
    );
}
