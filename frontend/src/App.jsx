// Importamos los componentes que necesitamos de las librerías y archivos correspondientes
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomeBody } from './components/HomeBody'
import { NetworkList } from './components/NetworkList'
import { NuevaRed } from './components/NuevaRed'
import { Home } from './Home'
import { QueryClientProvider, QueryClient } from 'react-query'
//YO
//import { Header } from './components/Header';
import logo from './assets/logo.png';
import logoFooter from "./assets/instagram.png";
import { TerminosCondiciones } from './components/TerminosCondiciones';
import { Footer } from './components/Footer'; // importar el componente Footer
import { Privacidad } from "./components/Privacidad";
import { QuienesSomos } from "./components/QuienesSomos";




// Creamos una instancia de QueryClient, que usaremos para manejar el estado de nuestra aplicación
const queryClient = new QueryClient();

// Definimos el componente App, que envuelve toda nuestra aplicación
export const App = () => {
  // Envolveremos nuestra aplicación en un QueryClientProvider, para que todos los componentes tengan acceso a nuestro queryClient
  return (
    <QueryClientProvider client={queryClient}>
      {/* Usamos BrowserRouter para definir las rutas de nuestra aplicación */}
      <BrowserRouter>
        <Routes>
          {/* La ruta raíz "/" está definida con el componente Home y tiene varias rutas hijas */}
          <Route path="/" element={<Home />}>
            {/* La ruta raíz también tiene un componente hijo que es el componente HomeBody */}
            <Route index element={<HomeBody></HomeBody>}></Route>



            {/* Las siguientes rutas hijas corresponden a diferentes secciones de nuestra aplicación */}
            {/*<Route path="/terminos-y-condiciones" element="TERMINOS Y CONDICIONES"></Route>
            <Route path="//quienes-somos" element="AQUI TE CONTAMOS QUIENES SOMOS"></Route>
            <Route path="/privacidad" element="NUESTRA PRIVACIDAD"></Route>
  <Route path="/instagram" element="ESTE ES NUESTRO INSTAGRAM"></Route>*/}


            <Route path="/quienes-somos" element={<QuienesSomos />} />
            <Route path="/terminos-y-condiciones" element={<TerminosCondiciones />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/networkList" element={<NetworkList />}></Route>
            <Route path="/nuevaRed" element={<NuevaRed />}></Route>
            {/* La ruta por defecto muestra un mensaje de error */}
            <Route path="*" element="not found"></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
