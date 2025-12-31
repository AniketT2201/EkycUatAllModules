import * as React from 'react';
import styles from './EkycTruboreUat.module.scss';
import type { IEkycTruboreUatProps } from './IEkycTruboreUatProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { SPComponentLoader } from '@microsoft/sp-loader';
import { ParallaxProvider } from 'react-scroll-parallax';
import { HashRouter, Route, Switch, useHistory } from 'react-router-dom';
import { ISPFXContext } from '@pnp/common';
import { Homepage } from './Pages/Homepage';
import { ViewKYC } from './Pages/ViewKYC';
import { Viewpage } from './Pages/Viewpage';
import { Attachmentpage } from './Pages/Attachmentpage';

SPComponentLoader.loadCss('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
SPComponentLoader.loadCss('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');
//SPComponentLoader.loadCss('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
//SPComponentLoader.loadCss('https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css');


// // 💤 Lazy loaded components
// const Homepage = React.lazy(() =>
//   import('./Pages/Homepage').then(module => ({ default: module.Homepage }))
// );
// const ViewKYC = React.lazy(() =>
//   import('./Pages/ViewKYC').then(module => ({ default: module.ViewKYC }))
// );
// const Viewpage = React.lazy(() =>
//   import('./Pages/Viewpage').then(module => ({ default: module.Viewpage }))
// );
// const Attachmentpage = React.lazy(() =>
//   import('./Pages/Attachmentpage').then(module => ({ default: module.Attachmentpage }))
// );

export default class EkycTruboreUat extends React.Component<IEkycTruboreUatProps> {
  public render(): React.ReactElement<IEkycTruboreUatProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    return (
      <section className={`${styles.ekycTruboreUat} ${hasTeamsContext ? styles.teams : ''}`}>
        <ParallaxProvider>
          <HashRouter>
            <React.Suspense fallback={<></>}>
              <Switch>
                <Route exact path="/" render={() => <Homepage {...this.props} />} />
                <Route exact path="/ViewKYC" render={() => <ViewKYC {...this.props} />} />
                <Route exact path="/Attachmentpage" render={() => <Attachmentpage {...this.props} />} />
                <Route exact path="/Viewpage" render={() => <Viewpage {...this.props} context={this.props.currentSPContext as unknown as ISPFXContext} httpClient={this.props.currentSPContext.httpClient}/>} />
              </Switch>
            </React.Suspense>
          </HashRouter>
        </ParallaxProvider>
      </section>
    );
  }
}
