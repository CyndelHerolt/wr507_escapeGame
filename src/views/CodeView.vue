<script setup>
import {RouterLink} from "vue-router";
</script>

<template>
  <main>
    <h2>Présentation du projet</h2>
    <p>
      <em>
        Un escape game en réalité virtuelle dans la douche.
      </em>
    </p>

    <section>
      <article>
        <h3>Synopsis</h3>
        <p>
          Piégé dans la douche par la terrible Sylvie, il vous faudra redoubler d'ingéniosité pour retrouver la clé qui
          vous permettra de vous échapper.
          Lugubre et particulièrement humide, la salle de bain est un lieu de tous les dangers.
        </p>
        <p>
          Votre arme de destruction massive ? Un pommeau de douche.
        </p>
        <hr>
        <h3>Etapes</h3>
        <ol>
          <li>Réparer la tuyauterie vetuste de l'IUT afin de débloquer le pommeau et un premier morceau de clé</li>
          <li>Nettoyer le mur de ses traces douteuses pour récupérer le code du coffre-fort</li>
          <li>Ouvrir le coffre et y récupérer un deuxième morceau de clé</li>
          <li>Remplir le tube d'eau pour pouvoir accéder au dernier morceau de clé</li>
          <li>Ouvrir la porte et s'enfuir</li>
        </ol>
      </article>
    </section>

    <section>
      <h3>Extraits de code</h3>

      <article>
        <h4>Réparation du tuyau</h4>
        <pre v-highlightjs>
          <code class="cs">
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FuiteBehaviourScript : MonoBehaviour
{
    private ParticleSystem myParticleSystem; // Renommage de la variable pour éviter le conflit
    private Quaternion initialRotation;

    void Start()
    {
        // Obtient la référence à l'effet de particule
        myParticleSystem = GetComponentInChildren< ParticleSystem >();

        // Sauvegarde la rotation initiale de l'objet
        initialRotation = transform.rotation;
    }

    void Update()
    {
        // Vérifie si l'utilisateur a cliqué sur l'objet
        if (Input.GetMouseButtonDown(0))
        {
            RaycastHit hit;
            Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);

            if (Physics.Raycast(ray, out hit))
            {
                if (hit.collider.gameObject == gameObject)
                {
                    // Arrête l'effet de particule
                    myParticleSystem.Stop();

                    // Réinitialise la rotation sur l'axe X
                    transform.rotation = Quaternion.Euler(initialRotation.eulerAngles.x, 0f, 0f);
                }
            }
        }
    }
}

          </code>
        </pre>
      </article>

      <article>
        <h4>Fonctionnement du pommeau de douche</h4>
        <pre v-highlightjs>
          <code class="cs">
using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit;

public class OnOffShower : MonoBehaviour
{
    private XRGrabInteractable grabInteractable;
    new private ParticleSystem particleSystem; // Utiliser le mot-clé new pour cacher le membre hérité

    void Start()
    {
        // Récupérer les références des composants
        grabInteractable = GetComponent< XRGrabInteractable >();
        particleSystem = GetComponentInChildren< ParticleSystem >();

        // Vérifier si les références sont valides
        if (grabInteractable == null || particleSystem == null)
        {
            Debug.LogError("XR Grab Interactable ou Particle System non trouvés.");
            return;
        }

        // Désactiver le système de particules au démarrage
        particleSystem.Stop();

        // S'abonner aux événements
        grabInteractable.selectEntered.AddListener(OnGrab);
        grabInteractable.selectExited.AddListener(OnRelease);
    }

    void OnGrab(SelectEnterEventArgs args)
    {
        // Démarrer le système de particules lorsque l'objet est saisi
        particleSystem.Play();
    }

    void OnRelease(SelectExitEventArgs args)
    {
        // Arrêter le système de particules lorsque l'objet est lâché
        if (!args.isCanceled)
        {
            particleSystem.Stop();
        }
    }
}
        </code></pre>
      </article>

      <article>
        <h4>Intéractions entre le pommeau et les éléments</h4>

        <pre v-highlightjs>
          <code class="cs">
using UnityEngine;

[RequireComponent(typeof(ParticleSystem))]
public class ParticleCollisionDetector : MonoBehaviour
{
    private ParticleSystem ps;

    public string[] targetTags;
    private const string WATER_TRIGGER_TAG = "waterTrigger";
    private const string WATER_IN_TUBE_TAG = "waterInTube";
    private const string DIRTY_WALL_TAG = "dirtyWall";
    private const string DIRTY_SPOT_MATERIAL_NAME = "dirt1 (Instance)";
    private const string DIRTY_SPOT_2_MATERIAL_NAME = "dirt2 (Instance)";
    private const string DIRTY_SPOT_3_MATERIAL_NAME = "dirt3 (Instance)";
    private const string DIRTY_SPOT_CODE_NAME = "code (Instance)";

    private const float scaleAdjustment = 1.01f;

    private bool dirtSpotCleared = false;
    private bool secondDirtSpotCleared = false;

    void Start()
    {
        ps = GetComponent< ParticleSystem >();

        var collisionModule = ps.collision;
        collisionModule.enabled = true;

        var mainModule = ps.main;
        mainModule.simulationSpace = ParticleSystemSimulationSpace.World;
    }

    void OnParticleCollision(GameObject other)
    {
        foreach (string targetTag in targetTags)
        {
            if (other.CompareTag(targetTag))
            {
                Interact(other);
            }
        }
    }

    void Interact(GameObject obj)
    {
        Renderer objRenderer = obj.GetComponent< Renderer >();
        Material[] materials = objRenderer.materials;

        foreach (Material material in materials)
        {
            // interactions avec le tube de verre
            if (obj.CompareTag(WATER_TRIGGER_TAG))
            {
                GameObject waterInTubeObject = GameObject.FindGameObjectWithTag(WATER_IN_TUBE_TAG);
                if (waterInTubeObject != null && waterInTubeObject.transform.localScale.y < 0.35f)
                {
                    waterInTubeObject.transform.localScale = new Vector3(waterInTubeObject.transform.localScale.x, waterInTubeObject.transform.localScale.y * scaleAdjustment, waterInTubeObject.transform.localScale.z);
                }
                else
                {
                    Debug.Log("Water level is full.");
                    return;
                }
            }
            // interactions avec les tâches sur le mur
            else if (obj.CompareTag(DIRTY_WALL_TAG))
            {
                if (material.name == DIRTY_SPOT_MATERIAL_NAME)
                {
                    ReduceMaterialAlpha(material, ref dirtSpotCleared);
                }
                else if (dirtSpotCleared && material.name == DIRTY_SPOT_2_MATERIAL_NAME)
                {
                    ReduceMaterialAlpha(material, ref secondDirtSpotCleared);
                }
                else if (dirtSpotCleared && secondDirtSpotCleared && material.name == DIRTY_SPOT_3_MATERIAL_NAME)
                {
                    ReduceMaterialAlpha(material);
                }
                if (material.name == DIRTY_SPOT_CODE_NAME) {
                    if (dirtSpotCleared == true) {
                        IncreaseMaterialAlpha(material,0.3f);
                    } else if (secondDirtSpotCleared == true) {
                        IncreaseMaterialAlpha(material,0.6f);
                    }
                }
            }
        }
    }

    void ReduceMaterialAlpha(Material material, ref bool flagToUpdate)
    {
        Color color = material.color;

        if (color.a <= 0)
        {
            Debug.Log("Material alpha is already 0.");
            return;
        }

        color.a -= 0.005f;
        material.color = color;

        if (color.a <= 0)
        {
            Debug.Log("Material alpha reached 0.");
            flagToUpdate = true;
        }
    }

    void ReduceMaterialAlpha(Material material)
    {
        ReduceMaterialAlpha(material, ref dirtSpotCleared);
    }

    void IncreaseMaterialAlpha(Material material, float max)
    {
        Color color = material.color;

        if (color.a == max)
        {
            Debug.Log("TEST");
            return;
        }

        color.a += 0.005f;
        material.color = color;
    }
}

          </code>
        </pre>
      </article>

      <article>
        <h4>Manipulation du coffre</h4>

        <pre v-highlightjs>
          <code class="cs">
            using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UnityEngine.XR.Interaction.Toolkit;

public class ChangeTextOnButtonClick : MonoBehaviour
{
    public TMP_Text screenText;
    bool clicked;
    public GameObject screen;
    public HingeJoint myHingeJoint;
    //  public XRGrabInteractable interactableDoor; // Référence au composant XRGrabInteractable de la porte

    public bool IsCorrectCode = false; // Variable pour suivre si le code est correct
    public GameObject door;


    public void OnClicked(int valeur)
    {
        // Accéder au contenu du TextMeshPro
        string contenu = screenText.text;

        // Recherche de la prochaine position vide dans la liste pour ajouter le chiffre
        int prochainePositionVide = -1;
        for (int i = 0; i < contenu.Length; i++)
        {
            if (contenu[i] == '0')
            {
                prochainePositionVide = i;
                break;
            }
        }

            // Créer une nouvelle chaîne avec la valeur mise à jour
            string nouvelleChaine = contenu.Substring(0, prochainePositionVide) + valeur.ToString() + contenu.Substring(prochainePositionVide + 1);

            // Mettre à jour le texte de l'écran avec la nouvelle chaîne
            screenText.text = nouvelleChaine;

            if (prochainePositionVide == 6)
            {
                StartCoroutine(ChangeColorAndReset());
                return;
            }
    }

    IEnumerator ChangeColorAndReset()
    {

        if (screenText.text == "1 3 1 2")
        {
             // Change la couleur du panneau en rouge
            screen.GetComponent< Image >().material.color = Color.green;

            IsCorrectCode = true;

            // codeCorrect = true;
            // Attend 2 secondes
            yield return new WaitForSeconds(2f);

            // Revert la couleur du panneau à sa couleur normale
            screen.GetComponent< Image >().material.color = Color.white;

            // Met à jour le texte
            screenText.text = "0 0 0 0";

            //  JointMotor motor = myHingeJoint.motor;
            var motor = myHingeJoint.motor;
            motor.force = 100;
            motor.targetVelocity = -90;
            motor.freeSpin = false;
            myHingeJoint.motor = motor;
            myHingeJoint.useMotor = true;
        } else {
            // Change la couleur du panneau en rouge
            screen.GetComponent< Image >().material.color = Color.red;

            // Attend 2 secondes
            yield return new WaitForSeconds(2f);

            // Revert la couleur du panneau à sa couleur normale
            screen.GetComponent< Image >().material.color = Color.white;

            // Met à jour le texte
            screenText.text = "0 0 0 0";
        }

    }

}
          </code>
        </pre>
      </article>
    </section>

    <section>
      <h3>
        Hiérarchie du projet
      </h3>

      <article>
        <h4>
          Projet
        </h4>
        <img src="/hierarchie.png" alt="">
      </article>
      <article>
        <h4>
          Scène
        </h4>
        <img src="/scene_hierarchie.png" alt="">
      </article>
    </section>

    <section>
      <h3>
        Projet final
      </h3>

      <article style="display: flex; justify-content: space-between">
        <div style="width: 50%">
          <h4>
            Vidéo de démonstration
          </h4>
          <iframe width="100%" height="630" src="/test_jeu.mp4" allowfullscreen></iframe>
        </div>
        <div  style="width: 45%">
          <h4>Commentaires sur le déroulement du jeu</h4>
          <div class="commentaires">
            <ol>
              <li>Ramasser le pommeau de douche (étape indiquée dans la boite de dialogue fixée sur le poignet gauche) permet de comprendre que le circuit d'eau est coupé et qu'il va falloir réparer ça si on veut passer à l'étape suivante. <span class="bold">L'effet de particule du pommeau est simplement désactivé tant que l'étape de réparation n'est pas validée.</span></li>
              <li>Réparer le tuyau déclenche l'apparition du 1er morceau de clé. On comprend alors qu'il va falloir en récupérer plusieurs pour terminer la partie. <span class="bold">Le clic sur le bouton réparer stop l'effet de particule du tuyau, masque celui affiché pour le remplacer par un autre objet qui lui est dans la bonne position.</span></li>
              <li>Maintenant, la boite de dialogue nous oriente de nouveau vers le pommmeau et met en avant le tube. Element principal de la 2eme étape. On remarque alors que l'eau qui sort du pommeau permet de remplir ce tube. Une fois plein, un nouveau morceau de clé apparaît. <span class="bold">Ici, il y a un plane invisible sur le dessus du tube qui, lorsqu'il entre en contact avec des particules, déclenche une modification de taille du cylindre contenu dans le tube.</span></li>
              <li>Maintenant, toujours à l'aide du pommeau, il faut nettoyer les tâches sur le mur de la douche pour laisser apparaître des chiffres. <span class="bold">Il y a sur le mur un plane qui contient pour Material 4 png (3 tâches et 1 suite de chiffres). Le contact avec les particules du pommeau entraine une baisse d'opacité pour les 3 png de tâches (chacun leur tour) et en parallèle, le png de la suite de chiffre gagne en opacité.</span></li>
              <li>Il suffit ensuite de saisir ce code sur le coffre qui trone au centre de la pièce depuis le début pour récupérer le dernier morceau de clé et s'enfuir.</li>
            </ol>
            <br>
              <em>Pour info, les étapes des taches sur le mur et du tube peuvent s'effectuer dans n'importe quel ordre.</em>

          </div>
        </div>
      </article>

      <article>
        <h4>
          Téléchargement
        </h4>
        <a href="/projet/buildEscapeShower.apk" download="buildEscapeShower.apk">
          <button>
            Télécharger le .apk
          </button>
        </a>
      </article>
    </section>
  </main>
</template>

<style scoped>
nav {
  display: flex;
  justify-content: flex-start;
  margin: 20px 0;
}

a {
  padding: 0 15px;
}

.active-link {
  background-color: rgba(224, 212, 202, 0.25);
}

img {
  width: 100%;
}
</style>
